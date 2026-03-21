import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/requireAdmin.middleware.js';
import {
  createRequest, listRequests, getRequest,
  patchRequest, removeRequest, addComment, listComments,
} from '../controllers/request.controller.js';

const router = Router();

router.get('/', requireAuth, listRequests);
router.post('/', requireAuth, createRequest);
router.get('/:id', requireAuth, getRequest);
router.patch('/:id', requireAuth, patchRequest);
router.delete('/:id', requireAuth, requireAdmin, removeRequest);
router.post('/:id/comments', requireAuth, addComment);
router.get('/:id/comments', requireAuth, listComments);

export default router;
