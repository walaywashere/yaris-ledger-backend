import type { ZodTypeAny } from 'zod';

import { ValidationError } from './errors.js';

export const parseWithSchema = <Schema extends ZodTypeAny>(schema: Schema, data: unknown) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError('Validation failed', result.error.flatten());
  }

  return result.data;
};