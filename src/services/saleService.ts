import { Prisma } from '@prisma/client';

import { prisma } from '../prisma/client.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import type { CreateSaleInput, UpdateSaleInput } from '../validators/saleSchemas.js';

const isNotFoundError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';

const assertCustomerExists = async (customerId: string) => {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });

  if (!customer) {
    throw new NotFoundError('Customer not found');
  }

  if (!customer.isActive) {
    throw new ValidationError('Customer is inactive');
  }

  return customer;
};

export const listSales = async (filters: {
  customerId?: string;
  locationId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return prisma.saleEntry.findMany({
    where: {
      ...(filters.customerId ? { customerId: filters.customerId } : {}),
      ...(filters.locationId
        ? {
            customer: {
              locationId: filters.locationId
            }
          }
        : {}),
      ...(filters.startDate || filters.endDate
        ? {
            entryDate: {
              ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
              ...(filters.endDate ? { lte: new Date(filters.endDate) } : {})
            }
          }
        : {})
    },
    include: {
      customer: {
        include: {
          location: true
        }
      }
    },
    orderBy: [{ entryDate: 'desc' }, { createdAt: 'desc' }]
  });
};

export const getSaleById = async (id: string) => {
  const sale = await prisma.saleEntry.findUnique({
    where: { id },
    include: {
      customer: {
        include: {
          location: true
        }
      },
      createdBy: true,
      updatedBy: true
    }
  });

  if (!sale) {
    throw new NotFoundError('Sale entry not found');
  }

  return sale;
};

export const createSale = async (input: CreateSaleInput) => {
  await assertCustomerExists(input.customerId);

  try {
    return await prisma.saleEntry.create({
      data: {
        customerId: input.customerId,
        entryDate: new Date(input.entryDate),
        containerQty: input.containerQty,
        unitPrice: new Prisma.Decimal(input.unitPrice),
        totalAmount: new Prisma.Decimal(input.totalAmount),
        notes: input.notes ?? null,
        createdById: input.createdById ?? null
      },
      include: {
        customer: {
          include: {
            location: true
          }
        }
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ValidationError('This customer already has an entry for that date');
    }

    throw error;
  }
};

export const updateSale = async (id: string, input: UpdateSaleInput) => {
  try {
    return await prisma.saleEntry.update({
      where: { id },
      data: {
        ...(input.containerQty !== undefined && { containerQty: input.containerQty }),
        ...(input.unitPrice !== undefined && { unitPrice: new Prisma.Decimal(input.unitPrice) }),
        ...(input.totalAmount !== undefined && { totalAmount: new Prisma.Decimal(input.totalAmount) }),
        ...(input.notes !== undefined && { notes: input.notes ?? null }),
        ...(input.updatedById !== undefined && { updatedById: input.updatedById })
      },
      include: {
        customer: {
          include: {
            location: true
          }
        }
      }
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new NotFoundError('Sale entry not found');
    }

    throw error;
  }
};

export const deleteSale = async (id: string) => {
  try {
    await prisma.saleEntry.delete({ where: { id } });
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new NotFoundError('Sale entry not found');
    }

    throw error;
  }
};