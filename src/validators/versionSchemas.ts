import { z } from 'zod';

export const semverPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export const getVersionQuerySchema = z.object({
  environment: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.toLowerCase())
    .optional()
});

export const createVersionSchema = z.object({
  version: z
    .string()
    .trim()
    .regex(semverPattern, 'Invalid semantic version format'),
  commit: z
    .string()
    .trim()
    .min(7, 'Commit hash must be at least 7 characters')
    .max(64),
  environment: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.toLowerCase())
    .optional(),
  deploymentId: z.string().trim().min(1).optional(),
  automated: z.boolean().optional(),
  metadata: z.record(z.any()).optional()
});

export const listVersionHistoryQuerySchema = z.object({
  environment: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.toLowerCase())
    .optional(),
  cursor: z.string().uuid().optional(),
  limit: z
    .coerce.number()
    .int()
    .positive()
    .max(100)
    .optional()
});

export type GetVersionQuery = z.infer<typeof getVersionQuerySchema>;
export type CreateVersionInput = z.infer<typeof createVersionSchema>;
export type VersionHistoryQuery = z.infer<typeof listVersionHistoryQuerySchema>;