import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { syncUser } from '../controllers/auth.controller.js';

const router = Router();

// POST /api/auth/sync-user — sync user after OAuth login
router.post('/sync-user', requireAuth, syncUser);

export default router;
