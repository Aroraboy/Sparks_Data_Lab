import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';

const router = Router();

// GET /api/admin/users
router.get('/users', requireAuth, requireAdmin, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', requireAuth, requireAdmin, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// GET /api/admin/analytics
router.get('/analytics', requireAuth, requireAdmin, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

export default router;
