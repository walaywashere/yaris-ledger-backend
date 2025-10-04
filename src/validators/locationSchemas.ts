import { z } from 'zod';

export const locationIdParamSchema = z.object({
  id: z.string().uuid('Invalid location id')
});

export const locationListQuerySchema = z.object({
  includeInactive: z.coerce.boolean().optional().default(false)
});

export const createLocationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  displayOrder: z.coerce.number().int().min(0).max(1_000).optional(),
  isActive: z.coerce.boolean().optional().default(true)
});

export const updateLocationSchema = createLocationSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided for update'
);

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;