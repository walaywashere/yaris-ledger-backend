import { z } from 'zod';

export const dailyReportQuerySchema = z.object({
  date: z.string().date(),
  locationId: z.string().uuid('Invalid location id').optional(),
  customerId: z.string().uuid('Invalid customer id').optional()
});

export const rangeReportQuerySchema = z
  .object({
    startDate: z.string().date(),
    endDate: z.string().date(),
    locationId: z.string().uuid('Invalid location id').optional(),
    customerId: z.string().uuid('Invalid customer id').optional()
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: 'startDate must be less than or equal to endDate',
    path: ['startDate']
  });

export type DailyReportQuery = z.infer<typeof dailyReportQuerySchema>;
export type RangeReportQuery = z.infer<typeof rangeReportQuerySchema>;