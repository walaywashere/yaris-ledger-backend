import type { Request, Response } from 'express';

import {
  createCustomer,
  getCustomerById,
  listCustomers,
  setCustomerActiveStatus,
  updateCustomer
} from '../services/customerService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseWithSchema } from '../utils/validation.js';
import {
  createCustomerSchema,
  customerIdParamSchema,
  customerListQuerySchema,
  updateCustomerSchema
} from '../validators/customerSchemas.js';

export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  const filters = parseWithSchema(customerListQuerySchema, req.query);
  const customers = await listCustomers(filters);

  res.json({ success: true, data: customers });
});

export const getCustomer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = parseWithSchema(customerIdParamSchema, req.params);
  const customer = await getCustomerById(id);

  res.json({ success: true, data: customer });
});

export const postCustomer = asyncHandler(async (req: Request, res: Response) => {
  const payload = parseWithSchema(createCustomerSchema, req.body);
  const customer = await createCustomer(payload);

  res.status(201).json({ success: true, data: customer });
});

export const patchCustomer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = parseWithSchema(customerIdParamSchema, req.params);
  const payload = parseWithSchema(updateCustomerSchema, req.body);
  const customer = await updateCustomer(id, payload);

  res.json({ success: true, data: customer });
});

export const archiveCustomer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = parseWithSchema(customerIdParamSchema, req.params);
  const customer = await setCustomerActiveStatus(id, false);

  res.json({ success: true, data: customer });
});

export const restoreCustomer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = parseWithSchema(customerIdParamSchema, req.params);
  const customer = await setCustomerActiveStatus(id, true);

  res.json({ success: true, data: customer });
});