import { Prisma } from '@prisma/client';

import { prisma } from '../prisma/client.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import type { CreateLocationInput, UpdateLocationInput } from '../validators/locationSchemas.js';

const isNotFoundError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';

export const listLocations = async (options: { includeInactive: boolean }) => {
  return prisma.location.findMany({
    where: options.includeInactive ? {} : { isActive: true },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }]
  });
};

export const createLocation = async (input: CreateLocationInput) => {
  try {
    return await prisma.location.create({
      data: {
        name: input.name,
        displayOrder: input.displayOrder ?? 0,
        isActive: input.isActive ?? true
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ValidationError('Location name must be unique');
    }

    throw error;
  }
};

export const updateLocation = async (id: string, input: UpdateLocationInput) => {
  try {
    return await prisma.location.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
        ...(input.isActive !== undefined && { isActive: input.isActive })
      }
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new NotFoundError('Location not found');
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ValidationError('Location name must be unique');
    }

    throw error;
  }
};

export const setLocationActiveStatus = async (id: string, isActive: boolean) => {
  try {
    return await prisma.location.update({
      where: { id },
      data: { isActive }
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new NotFoundError('Location not found');
    }

    throw error;
  }
};