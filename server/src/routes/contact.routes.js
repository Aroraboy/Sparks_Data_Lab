import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/contacts
router.get('/', requireAuth, (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

export default router;
