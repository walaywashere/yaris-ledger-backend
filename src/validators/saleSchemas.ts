import { z } from 'zod';

const decimalString = z
  .union([z.number(), z.string()])
  .transform((value) => (typeof value === 'number' ? value.toString() : value))
  .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), 'Value must be a decimal with up to 2 places');

export const saleIdParamSchema = z.object({
  id: z.string().uuid('Invalid sale id')
});

export const saleListQuerySchema = z.object({
  customerId: z.string().uuid('Invalid customer id').optional(),
  locationId: z.string().uuid('Invalid location id').optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional()
});

export const createSaleSchema = z.object({
  customerId: z.string().uuid('Invalid customer id'),
  entryDate: z.string().date(),
  containerQty: z.number().int().min(0),
  unitPrice: decimalString,
  totalAmount: decimalString,
  notes: z.string().trim().max(1024).optional(),
  createdById: z.string().uuid().optional()
});

export const updateSaleSchema = createSaleSchema
  .omit({ customerId: true, entryDate: true, createdById: true })
  .partial()
  .extend({
    updatedById: z.string().uuid().optional()
  })
  .refine((data) => Object.keys(data).length > 0, 'At least one field must be provided for update');

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>;