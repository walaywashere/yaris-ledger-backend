import { PrismaClient, UserRole } from '@prisma/client';

import { createEnvConfig } from '../src/config/env.js';
import { hashPassword } from '../src/utils/password.js';

const prisma = new PrismaClient();

const DEFAULT_ADMIN_PASSWORD = 'ChangeMe123!';

const main = async () => {
  const env = createEnvConfig();

  console.log('Seeding database for environment:', env.NODE_ENV);

  const [adminUser, defaultLocation] = await Promise.all([
    prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        fullName: 'Administrator',
        passwordHash: await hashPassword(DEFAULT_ADMIN_PASSWORD),
        role: UserRole.ADMIN,
        email: 'admin@example.com'
      }
    }),
    prisma.location.upsert({
      where: { name: 'Default Route' },
      update: {},
      create: {
        name: 'Default Route',
        displayOrder: 0
      }
    })
  ]);

  await prisma.setting.upsert({
    where: { key: 'container_price' },
    update: {
      value: { amount: 0, currency: 'PHP' },
      updatedById: adminUser.id
    },
    create: {
      key: 'container_price',
      value: { amount: 0, currency: 'PHP' },
      description: 'Default container price in PHP',
      updatedById: adminUser.id
    }
  });

  console.log('Seed completed.');
  console.log('Admin credentials -> username: admin | password:', DEFAULT_ADMIN_PASSWORD);
  console.log('Default location id:', defaultLocation.id);
};

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });