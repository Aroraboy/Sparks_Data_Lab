import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { listPermits, patchPermit } from '../controllers/permit.controller.js';

const router = Router();

router.get('/', requireAuth, listPermits);
router.patch('/:id', requireAuth, patchPermit);

export default router;
