import express from 'express';
import { analyzeExperiment } from '../services/geminiService.js';

const router = express.Router();

/**
 * Get only EXECUTIVE SUMMARY for an experiment
 * Example: POST /executive-summary
 */
router.post('/', async (req, res) => {
  try {
    const { experimentLink, experimentTitle, experimentAuthors } = req.body;

    const analysis = await analyzeExperiment(experimentLink, experimentTitle, experimentAuthors);

    if (!analysis.sections.executiveSummary) {
      return res.status(404).json({ success: false, message: 'Executive summary not found' });
    }

    res.json({
      success: true,
      section: 'EXECUTIVE SUMMARY',
      data: analysis.sections.executiveSummary
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
