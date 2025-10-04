import type { Request, Response } from 'express';

import { listLocations, createLocation, updateLocation, setLocationActiveStatus } from '../services/locationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseWithSchema } from '../utils/validation.js';
import {
  createLocationSchema,
  locationIdParamSchema,
  locationListQuerySchema,
  updateLocationSchema
} from '../validators/locationSchemas.js';

export const getLocations = asyncHandler(async (req: Request, res: Response) => {
  const { includeInactive } = parseWithSchema(locationListQuerySchema, req.query);
  const locations = await listLocations({ includeInactive });

  res.json({ success: true, data: locations });
});

export const postLocation = asyncHandler(async (req: Request, res: Response) => {
  const payload = parseWithSchema(createLocationSchema, req.body);
  const location = await createLocation(payload);

  res.status(201).json({ success: true, data: location });
});

export const patchLocation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = parseWithSchema(locationIdParamSchema, req.params);
  const payload = parseWithSchema(updateLocationSchema, req.body);
  const location = await updateLocation(id, payload);

  res.json({ success: true, data: location });
});

export const archiveLocation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = parseWithSchema(locationIdParamSchema, req.params);
  const location = await setLocationActiveStatus(id, false);

  res.json({ success: true, data: location });
});

export const restoreLocation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = parseWithSchema(locationIdParamSchema, req.params);
  const location = await setLocationActiveStatus(id, true);

  res.json({ success: true, data: location });
});