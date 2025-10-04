import { PrismaClient } from '@prisma/client';

import { createEnvConfig } from '../config/env.js';

declare global {
  var prisma: PrismaClient | undefined;
}

const env = createEnvConfig();

const prismaClient = globalThis.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL
      }
    }
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prismaClient;
}

export const prisma = prismaClient;