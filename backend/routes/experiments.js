import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { analyzeExperiment, generateQuickSummary } from '../services/geminiService.js';

const router = express.Router();

/**
 * Search experiments by title or scientist name
 * POST /api/experiments/search
 * Body: { query: string }
 */
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const searchTerm = query.trim();

    // Search in both title and authors using full-text search
    const searchQuery = `
      SELECT
        id,
        title,
        authors,
        link,
        ts_rank(to_tsvector('english', title || ' ' || authors), plainto_tsquery('english', $1)) as rank
      FROM experiments
      WHERE
        to_tsvector('english', title || ' ' || authors) @@ plainto_tsquery('english', $1)
        OR title ILIKE $2
        OR authors ILIKE $2
      ORDER BY rank DESC, title ASC
      LIMIT 50
    `;

    const result = await pool.query(searchQuery, [searchTerm, `%${searchTerm}%`]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        message: 'No experiments found matching your search',
        results: [],
        query: searchTerm,
        count: 0
      });
    }

    res.json({
      success: true,
      results: result.rows.map(row => ({
        id: row.id,
        title: row.title,
        authors: row.authors,
        link: row.link
      })),
      query: searchTerm,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error searching experiments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search experiments',
      details: error.message
    });
  }
});

/**
 * Get experiment by ID
 * GET /api/experiments/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, title, authors, link FROM experiments WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Experiment not found'
      });
    }

    res.json({
      success: true,
      experiment: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching experiment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch experiment',
      details: error.message
    });
  }
});

/**
 * Analyze experiment using Gemini API
 * POST /api/experiments/:id/analyze
 */
router.post('/:id/analyze', async (req, res) => {
  try {
    const { id } = req.params;

    // Get experiment details
    const result = await pool.query(
      'SELECT id, title, authors, link FROM experiments WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Experiment not found'
      });
    }

    const experiment = result.rows[0];

    // Analyze using Gemini API
    console.log(`Analyzing experiment: ${experiment.title}`);
    const analysis = await analyzeExperiment(
      experiment.link,
      experiment.title,
      experiment.authors
    );

    if (!analysis.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to analyze experiment',
        details: analysis.error
      });
    }

    // Store analysis in database for caching (optional)
    try {
      await pool.query(
        `INSERT INTO experiment_analyses (experiment_id, analysis_data, created_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (experiment_id)
         DO UPDATE SET analysis_data = $2, updated_at = CURRENT_TIMESTAMP`,
        [id, JSON.stringify(analysis)]
      );
    } catch (dbError) {
      // If table doesn't exist yet, just log but continue
      console.log('Note: experiment_analyses table not found, skipping cache');
    }

    res.json({
      success: true,
      experiment: {
        id: experiment.id,
        title: experiment.title,
        authors: experiment.authors,
        link: experiment.link
      },
      analysis
    });

  } catch (error) {
    console.error('Error analyzing experiment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze experiment',
      details: error.message
    });
  }
});

/**
 * Get all experiments (paginated)
 * GET /api/experiments?page=1&limit=20
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM experiments');
    const totalCount = parseInt(countResult.rows[0].count);

    // Get paginated results
    const result = await pool.query(
      'SELECT id, title, authors, link FROM experiments ORDER BY title ASC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json({
      success: true,
      experiments: result.rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching experiments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch experiments',
      details: error.message
    });
  }
});

/**
 * Get random experiments for exploration
 * GET /api/experiments/random/:count
 */
router.get('/random/:count', async (req, res) => {
  try {
    const count = Math.min(parseInt(req.params.count) || 5, 20);

    const result = await pool.query(
      'SELECT id, title, authors, link FROM experiments ORDER BY RANDOM() LIMIT $1',
      [count]
    );

    res.json({
      success: true,
      experiments: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching random experiments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch random experiments',
      details: error.message
    });
  }
});

/**
 * Get experiments by scientist
 * GET /api/experiments/scientist/:name
 */
router.get('/scientist/:name', async (req, res) => {
  try {
    const scientistName = req.params.name;

    const result = await pool.query(
      `SELECT id, title, authors, link
       FROM experiments
       WHERE authors ILIKE $1
       ORDER BY title ASC`,
      [`%${scientistName}%`]
    );

    res.json({
      success: true,
      scientist: scientistName,
      experiments: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching experiments by scientist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch experiments by scientist',
      details: error.message
    });
  }
});

export default router;
