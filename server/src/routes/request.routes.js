import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';

const router = Router();

// GET /api/requests
router.get('/', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// POST /api/requests
router.post('/', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// GET /api/requests/:id
router.get('/:id', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// PATCH /api/requests/:id
router.patch('/:id', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// DELETE /api/requests/:id
router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// POST /api/requests/:id/comments
router.post('/:id/comments', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// GET /api/requests/:id/comments
router.get('/:id/comments', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

export default router;
