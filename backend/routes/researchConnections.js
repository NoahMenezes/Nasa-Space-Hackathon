import express from 'express';
import { analyzeExperiment } from '../services/geminiService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { experimentLink, experimentTitle, experimentAuthors } = req.body;
    const analysis = await analyzeExperiment(experimentLink, experimentTitle, experimentAuthors);

    if (!analysis.sections.researchConnections) {
      return res.status(404).json({ success: false, message: 'Research connections not found' });
    }

    res.json({ success: true, section: 'RESEARCH CONNECTIONS', data: analysis.sections.researchConnections });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
