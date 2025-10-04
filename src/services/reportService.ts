import type { Prisma } from '@prisma/client';

import { prisma } from '../prisma/client.js';
import { getManilaDayRange, getManilaRange } from '../utils/timezone.js';
import type { DailyReportQuery, RangeReportQuery } from '../validators/reportSchemas.js';

const saleInclude = {
  customer: {
    include: {
      location: true
    }
  },
  createdBy: true,
  updatedBy: true
} as const;

type SaleWhere = Prisma.SaleEntryWhereInput;

const buildWhere = (
  filters: { customerId?: string; locationId?: string },
  range: { start: Date; end: Date }
): SaleWhere => ({
  entryDate: {
    gte: range.start,
    lte: range.end
  },
  ...(filters.customerId ? { customerId: filters.customerId } : {}),
  ...(filters.locationId
    ? {
        customer: {
          locationId: filters.locationId
        }
      }
    : {})
});

const formatDecimal = (value: Prisma.Decimal | null | undefined) =>
  value ? Number(value.toString()) : 0;

const summarizeSales = async (where: SaleWhere) => {
  const aggregate = await prisma.saleEntry.aggregate({
    where,
    _sum: {
      containerQty: true,
      totalAmount: true
    },
    _count: {
      _all: true
    }
  });

  return {
    totalEntries: aggregate._count._all ?? 0,
    totalContainers: aggregate._sum.containerQty ?? 0,
    totalAmount: formatDecimal(aggregate._sum.totalAmount)
  };
};

export const getDailySalesReport = async (filters: DailyReportQuery) => {
  const range = getManilaDayRange(filters.date);
  const where = buildWhere(filters, range);

  const [records, summary] = await Promise.all([
    prisma.saleEntry.findMany({
      where,
      include: saleInclude,
      orderBy: [{ entryDate: 'asc' }, { createdAt: 'asc' }]
    }),
    summarizeSales(where)
  ]);

  return {
    range,
    records,
    summary
  };
};

export const getRangeSalesReport = async (filters: RangeReportQuery) => {
  const range = getManilaRange(filters.startDate, filters.endDate);
  const where = buildWhere(filters, range);

  const [records, summary] = await Promise.all([
    prisma.saleEntry.findMany({
      where,
      include: saleInclude,
      orderBy: [{ entryDate: 'asc' }, { createdAt: 'asc' }]
    }),
    summarizeSales(where)
  ]);

  return {
    range,
    records,
    summary
  };
};