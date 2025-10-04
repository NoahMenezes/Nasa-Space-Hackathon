import express from 'express';
import { analyzeExperiment } from '../services/geminiService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { experimentLink, experimentTitle, experimentAuthors } = req.body;
    const analysis = await analyzeExperiment(experimentLink, experimentTitle, experimentAuthors);

    if (!analysis.sections.futureResearch) {
      return res.status(404).json({ success: false, message: 'Future research recommendations not found' });
    }

    res.json({ success: true, section: 'FUTURE RESEARCH', data: analysis.sections.futureResearch });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
