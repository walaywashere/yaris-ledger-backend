import { Prisma } from '@prisma/client';

import { prisma } from '../prisma/client.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import type {
  CreateCustomerInput,
  CustomerListQuery,
  UpdateCustomerInput
} from '../validators/customerSchemas.js';

const isNotFoundError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';

const assertLocationExists = async (locationId: string) => {
  const location = await prisma.location.findUnique({ where: { id: locationId } });

  if (!location) {
    throw new NotFoundError('Location not found');
  }

  return location;
};

export const listCustomers = async (filters: CustomerListQuery) => {
  return prisma.customer.findMany({
    where: {
      ...(filters.includeInactive ? {} : { isActive: true }),
      ...(filters.locationId ? { locationId: filters.locationId } : {}),
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: 'insensitive' } },
              { code: { contains: filters.search, mode: 'insensitive' } }
            ]
          }
        : {})
    },
    include: {
      location: true
    },
    orderBy: [{ name: 'asc' }]
  });
};

export const getCustomerById = async (id: string) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { location: true }
  });

  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  return customer;
};

export const createCustomer = async (input: CreateCustomerInput) => {
  await assertLocationExists(input.locationId);

  try {
    return await prisma.customer.create({
      data: {
        name: input.name,
        locationId: input.locationId,
        code: input.code,
        notes: input.notes ?? null,
        isActive: input.isActive ?? true
      },
      include: { location: true }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ValidationError('Customer code must be unique');
    }

    throw error;
  }
};

export const updateCustomer = async (id: string, input: UpdateCustomerInput) => {
  if (input.locationId) {
    await assertLocationExists(input.locationId);
  }

  try {
    return await prisma.customer.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.code !== undefined && { code: input.code }),
        ...(input.notes !== undefined && { notes: input.notes ?? null }),
        ...(input.locationId !== undefined && { locationId: input.locationId }),
        ...(input.isActive !== undefined && { isActive: input.isActive })
      },
      include: { location: true }
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new NotFoundError('Customer not found');
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ValidationError('Customer code must be unique');
    }

    throw error;
  }
};

export const setCustomerActiveStatus = async (id: string, isActive: boolean) => {
  try {
    return await prisma.customer.update({
      where: { id },
      data: { isActive },
      include: { location: true }
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new NotFoundError('Customer not found');
    }

    throw error;
  }
};