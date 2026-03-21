import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/permits
router.get('/', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// PATCH /api/permits/:id
router.patch('/:id', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

export default router;
