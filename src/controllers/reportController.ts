import type { Request, Response } from 'express';

import { getDailySalesReport, getRangeSalesReport } from '../services/reportService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseWithSchema } from '../utils/validation.js';
import { dailyReportQuerySchema, rangeReportQuerySchema } from '../validators/reportSchemas.js';

export const getDailyReport = asyncHandler(async (req: Request, res: Response) => {
  const query = parseWithSchema(dailyReportQuerySchema, req.query);
  const report = await getDailySalesReport(query);

  res.json({ success: true, data: report });
});

export const getRangeReport = asyncHandler(async (req: Request, res: Response) => {
  const query = parseWithSchema(rangeReportQuerySchema, req.query);
  const report = await getRangeSalesReport(query);

  res.json({ success: true, data: report });
});