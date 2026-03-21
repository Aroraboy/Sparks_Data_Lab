import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { listContacts } from '../controllers/contact.controller.js';

const router = Router();

router.get('/', requireAuth, listContacts);

export default router;
