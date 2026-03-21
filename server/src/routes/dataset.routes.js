import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/datasets
router.get('/', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// POST /api/datasets
router.post('/', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// GET /api/datasets/:id
router.get('/:id', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// PATCH /api/datasets/:id
router.patch('/:id', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// POST /api/datasets/:id/sources
router.post('/:id/sources', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

// POST /api/datasets/:id/import-sheet
router.post('/:id/import-sheet', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

export default router;
