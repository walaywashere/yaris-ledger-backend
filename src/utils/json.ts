import type { Prisma } from '@prisma/client';

import { ValidationError } from './errors.js';

export const ensureJsonValue = (
  value: unknown,
  errorMessage = 'Value must be JSON-serializable'
): Prisma.InputJsonValue => {
  try {
    JSON.stringify(value);
    return value as Prisma.InputJsonValue;
  } catch {
    throw new ValidationError(errorMessage);
  }
};