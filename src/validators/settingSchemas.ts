import { z } from 'zod';

export const settingKeyParamSchema = z.object({
  key: z.string().trim().min(1).max(120)
});

export const updateSettingSchema = z.object({
  value: z.unknown(),
  description: z.string().max(255).optional(),
  updatedById: z.string().uuid('Invalid user id').optional()
});

export const listSettingsQuerySchema = z.object({
  prefix: z.string().trim().max(120).optional()
});

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
export type ListSettingsQuery = z.infer<typeof listSettingsQuerySchema>;