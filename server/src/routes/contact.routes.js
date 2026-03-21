import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  listContacts,
  searchPdlPersons,
  enrichPdlPerson,
  searchPdlCompanies,
  verifyContactEmail,
  verifyBatchEmails,
} from '../controllers/contact.controller.js';

const router = Router();

router.get('/', requireAuth, listContacts);

// PDL endpoints
router.post('/pdl/search-persons', requireAuth, searchPdlPersons);
router.post('/pdl/enrich', requireAuth, enrichPdlPerson);
router.post('/pdl/search-companies', requireAuth, searchPdlCompanies);

// NeverBounce endpoints
router.post('/verify-email', requireAuth, verifyContactEmail);
router.post('/verify-batch', requireAuth, verifyBatchEmails);

export default router;
