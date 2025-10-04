import type { Request, Response } from 'express';

import { createSale, deleteSale, getSaleById, listSales, updateSale } from '../services/saleService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseWithSchema } from '../utils/validation.js';
import {
  createSaleSchema,
  saleIdParamSchema,
  saleListQuerySchema,
  updateSaleSchema
} from '../validators/saleSchemas.js';

export const getSales = asyncHandler(async (req: Request, res: Response) => {
  const filters = parseWithSchema(saleListQuerySchema, req.query);
  const sales = await listSales(filters);

  res.json({ success: true, data: sales });
});

export const getSale = asyncHandler(async (req: Request, res: Response) => {
  const { id } = parseWithSchema(saleIdParamSchema, req.params);
  const sale = await getSaleById(id);

  res.json({ success: true, data: sale });
});

export const postSale = asyncHandler(async (req: Request, res: Response) => {
  const payload = parseWithSchema(createSaleSchema, req.body);
  const sale = await createSale(payload);

  res.status(201).json({ success: true, data: sale });
});

export const patchSale = asyncHandler(async (req: Request, res: Response) => {
  const { id } = parseWithSchema(saleIdParamSchema, req.params);
  const payload = parseWithSchema(updateSaleSchema, req.body);
  const sale = await updateSale(id, payload);

  res.json({ success: true, data: sale });
});

export const removeSale = asyncHandler(async (req: Request, res: Response) => {
  const { id } = parseWithSchema(saleIdParamSchema, req.params);
  await deleteSale(id);

  res.status(204).send();
});