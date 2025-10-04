import type { Prisma } from '@prisma/client';

import { prisma } from '../prisma/client.js';
import { NotFoundError } from '../utils/errors.js';
import { ensureJsonValue } from '../utils/json.js';
import type {
  CreateVersionInput,
  GetVersionQuery,
  VersionHistoryQuery
} from '../validators/versionSchemas.js';

const normalizeEnvironment = (environment?: string) =>
  (environment ?? 'development').toLowerCase();

const ensureMetadata = (metadata: unknown): Prisma.InputJsonValue | undefined => {
  if (metadata === undefined) {
    return undefined;
  }

  return ensureJsonValue(metadata, 'Metadata must be JSON-serializable');
};

export const getLatestVersion = async (query: GetVersionQuery) => {
  const environment = query.environment ? normalizeEnvironment(query.environment) : undefined;

  const version = await prisma.deploymentVersion.findFirst({
    where: environment ? { environment } : undefined,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
  });

  if (!version) {
    throw new NotFoundError('Version information not found');
  }

  return version;
};

export const recordVersion = async (input: CreateVersionInput) => {
  const environment = normalizeEnvironment(input.environment);
  const metadata = ensureMetadata(input.metadata);

  // Prevent duplicates for the same environment and commit hash by updating existing records
  const existing = await prisma.deploymentVersion.findFirst({
    where: {
      environment,
      commit: input.commit
    }
  });

  if (existing) {
    return prisma.deploymentVersion.update({
      where: { id: existing.id },
      data: {
        version: input.version,
        deploymentId: input.deploymentId ?? existing.deploymentId,
        automated: input.automated ?? existing.automated,
        metadata
      }
    });
  }

  return prisma.deploymentVersion.create({
    data: {
      version: input.version,
      commit: input.commit,
      environment,
      deploymentId: input.deploymentId,
      automated: input.automated ?? true,
      metadata
    }
  });
};

export const getVersionHistory = async (query: VersionHistoryQuery) => {
  const environment = query.environment ? normalizeEnvironment(query.environment) : undefined;
  const limit = Math.min(query.limit ?? 20, 100);

  const versions = await prisma.deploymentVersion.findMany({
    where: environment ? { environment } : undefined,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    ...(query.cursor
      ? {
          skip: 1,
          cursor: { id: query.cursor }
        }
      : {})
  });

  const hasMore = versions.length > limit;
  const items = hasMore ? versions.slice(0, limit) : versions;

  return {
    items,
    nextCursor: hasMore ? versions[limit].id : undefined
  };
};