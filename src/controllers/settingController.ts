import type { Request, Response } from 'express';

import { deleteSetting, getSetting, listSettings, upsertSetting } from '../services/settingService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseWithSchema } from '../utils/validation.js';
import {
  listSettingsQuerySchema,
  settingKeyParamSchema,
  updateSettingSchema
} from '../validators/settingSchemas.js';

export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const filters = parseWithSchema(listSettingsQuerySchema, req.query);
  const settings = await listSettings(filters);

  res.json({ success: true, data: settings });
});

export const getSettingByKey = asyncHandler(async (req: Request, res: Response) => {
  const { key } = parseWithSchema(settingKeyParamSchema, req.params);
  const setting = await getSetting(key);

  res.json({ success: true, data: setting });
});

export const putSetting = asyncHandler(async (req: Request, res: Response) => {
  const { key } = parseWithSchema(settingKeyParamSchema, req.params);
  const payload = parseWithSchema(updateSettingSchema, req.body);
  const setting = await upsertSetting(key, payload);

  res.json({ success: true, data: setting });
});

export const deleteSettingByKey = asyncHandler(async (req: Request, res: Response) => {
  const { key } = parseWithSchema(settingKeyParamSchema, req.params);
  await deleteSetting(key);

  res.status(204).send();
});