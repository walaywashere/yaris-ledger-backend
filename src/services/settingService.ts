import { Prisma } from '@prisma/client';

import { prisma } from '../prisma/client.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import type { ListSettingsQuery, UpdateSettingInput } from '../validators/settingSchemas.js';

const ensureJsonValue = (value: unknown): Prisma.InputJsonValue => {
  try {
    JSON.stringify(value);
    return value as Prisma.InputJsonValue;
  } catch {
    throw new ValidationError('Setting value must be JSON-serializable');
  }
};

export const listSettings = async (filters: ListSettingsQuery) => {
  return prisma.setting.findMany({
    where: filters.prefix
      ? {
          key: {
            startsWith: filters.prefix
          }
        }
      : {},
    orderBy: [{ key: 'asc' }]
  });
};

export const getSetting = async (key: string) => {
  const setting = await prisma.setting.findUnique({ where: { key } });

  if (!setting) {
    throw new NotFoundError('Setting not found');
  }

  return setting;
};

export const upsertSetting = async (key: string, input: UpdateSettingInput) => {
  return prisma.setting.upsert({
    where: { key },
    create: {
      key,
  value: ensureJsonValue(input.value),
      description: input.description,
      updatedById: input.updatedById ?? null
    },
    update: {
  value: ensureJsonValue(input.value),
      description: input.description,
      updatedById: input.updatedById ?? null
    }
  });
};

export const deleteSetting = async (key: string) => {
  try {
    await prisma.setting.delete({ where: { key } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundError('Setting not found');
    }

    throw error;
  }
};