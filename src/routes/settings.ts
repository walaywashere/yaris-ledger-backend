import { Router } from 'express';

import {
  deleteSettingByKey,
  getSettingByKey,
  getSettings,
  putSetting
} from '../controllers/settingController.js';
import { requireAuth } from '../middleware/auth.js';

export const settingsRouter = Router();

settingsRouter.use(requireAuth);

settingsRouter.get('/', getSettings);
settingsRouter.get('/:key', getSettingByKey);
settingsRouter.put('/:key', putSetting);
settingsRouter.delete('/:key', deleteSettingByKey);