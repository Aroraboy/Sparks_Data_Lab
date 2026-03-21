import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';
import { listAdminUsers, updateUserRole, getAnalytics, getScrapeLogs } from '../controllers/admin.controller.js';

const router = Router();

router.get('/users', requireAuth, requireAdmin, listAdminUsers);
router.patch('/users/:id/role', requireAuth, requireAdmin, updateUserRole);
router.get('/analytics', requireAuth, requireAdmin, getAnalytics);
router.get('/scrape-logs', requireAuth, requireAdmin, getScrapeLogs);

export default router;
