import express from 'express';
import { analyzeExperiment } from '../services/geminiService.js';

const router = express.Router();

/**
 * Get only EXPERIMENT DETAILS
 * Example: POST /experiment-details
 */
router.post('/', async (req, res) => {
  try {
    const { experimentLink, experimentTitle, experimentAuthors } = req.body;

    const analysis = await analyzeExperiment(experimentLink, experimentTitle, experimentAuthors);

    if (!analysis.sections.experimentDetails) {
      return res.status(404).json({ success: false, message: 'Experiment details not found' });
    }

    res.json({
      success: true,
      section: 'EXPERIMENT DETAILS',
      data: analysis.sections.experimentDetails
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

