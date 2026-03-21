import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';
import { listAdminUsers, updateUserRole, getAnalytics } from '../controllers/admin.controller.js';

const router = Router();

router.get('/users', requireAuth, requireAdmin, listAdminUsers);
router.patch('/users/:id/role', requireAuth, requireAdmin, updateUserRole);
router.get('/analytics', requireAuth, requireAdmin, getAnalytics);

export default router;
