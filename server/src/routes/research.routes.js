import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// POST /api/research
router.post('/', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// GET /api/research/history
router.get('/history', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

export default router;
