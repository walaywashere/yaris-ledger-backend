import { z } from 'zod';

const optionalLimitedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length === 0 ? undefined : value));

export const customerIdParamSchema = z.object({
  id: z.string().uuid('Invalid customer id')
});

export const customerListQuerySchema = z.object({
  includeInactive: z.coerce.boolean().optional().default(false),
  locationId: z.string().uuid('Invalid location id').optional(),
  search: optionalLimitedString(255).optional()
});

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Customer name is required').max(255),
  locationId: z.string().uuid('Invalid location id'),
  code: optionalLimitedString(50).optional(),
  notes: optionalLimitedString(1024).optional(),
  isActive: z.coerce.boolean().optional().default(true)
});

export const updateCustomerSchema = createCustomerSchema
  .omit({ locationId: true })
  .partial()
  .extend({
    locationId: z.string().uuid('Invalid location id').optional()
  })
  .refine((data) => Object.keys(data).length > 0, 'At least one field must be provided for update');

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;