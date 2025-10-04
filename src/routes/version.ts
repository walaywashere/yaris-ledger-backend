import { Router } from 'express';

import {
  getVersion,
  getVersionHistoryHandler,
  postVersion
} from '../controllers/versionController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

export const versionRouter = Router();

versionRouter.get('/', getVersion);
versionRouter.post('/', postVersion);
versionRouter.get('/history', requireAuth, requireAdmin, getVersionHistoryHandler);