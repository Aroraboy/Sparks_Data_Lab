import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { runResearch, getHistory } from '../controllers/research.controller.js';

const router = Router();

router.post('/', requireAuth, runResearch);
router.get('/history', requireAuth, getHistory);

export default router;
