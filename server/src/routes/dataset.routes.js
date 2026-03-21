import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { listDatasets, createDataset, getDataset, patchDataset, addSource, importSheet } from '../controllers/dataset.controller.js';

const router = Router();

router.get('/', requireAuth, listDatasets);
router.post('/', requireAuth, createDataset);
router.get('/:id', requireAuth, getDataset);
router.patch('/:id', requireAuth, patchDataset);
router.post('/:id/sources', requireAuth, addSource);
router.post('/:id/import-sheet', requireAuth, importSheet);

export default router;
