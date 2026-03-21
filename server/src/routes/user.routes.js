import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { listUsers, getUser, updateUser } from '../controllers/user.controller.js';

const router = Router();

router.get('/', requireAuth, listUsers);
router.get('/:id', requireAuth, getUser);
router.patch('/:id', requireAuth, updateUser);

export default router;
