import { Router } from 'express';

import { getDailyReport, getRangeReport } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';

export const reportsRouter = Router();

reportsRouter.use(requireAuth);

reportsRouter.get('/daily', getDailyReport);
reportsRouter.get('/range', getRangeReport);