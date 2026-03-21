import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/notifications
router.get('/', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// PATCH /api/notifications/read-all
router.patch('/read-all', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

export default router;
