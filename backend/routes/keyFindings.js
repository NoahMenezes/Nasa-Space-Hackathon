import express from 'express';
import { analyzeExperiment } from '../services/geminiService.js';

const router = express.Router();

/**
 * Get only KEY FINDINGS
 * Example: POST /key-findings
 */
router.post('/', async (req, res) => {
  try {
    const { experimentLink, experimentTitle, experimentAuthors } = req.body;

    const analysis = await analyzeExperiment(experimentLink, experimentTitle, experimentAuthors);

    if (!analysis.sections.keyFindings) {
      return res.status(404).json({ success: false, message: 'Key findings not found' });
    }

    res.json({
      success: true,
      section: 'KEY FINDINGS',
      data: analysis.sections.keyFindings
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
