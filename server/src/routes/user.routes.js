import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/users
router.get('/', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// GET /api/users/:id
router.get('/:id', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// PATCH /api/users/:id
router.patch('/:id', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

export default router;
