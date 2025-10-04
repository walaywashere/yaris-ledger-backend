import type { DeploymentVersion } from '@prisma/client';
import type { Request, Response } from 'express';

import { getLatestVersion, getVersionHistory, recordVersion } from '../services/versionService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseWithSchema } from '../utils/validation.js';
import {
  createVersionSchema,
  getVersionQuerySchema,
  listVersionHistoryQuerySchema
} from '../validators/versionSchemas.js';

const toResponsePayload = (entry: DeploymentVersion) => {
  const buildDate = entry.createdAt.toISOString();

  return {
    version: entry.version,
    semanticVersion: entry.version,
    commit: entry.commit,
    environment: entry.environment,
    deploymentId: entry.deploymentId ?? null,
    automated: entry.automated,
    metadata: entry.metadata ?? null,
    buildDate,
    buildTime: entry.createdAt.getTime()
  };
};

export const getVersion = asyncHandler(async (req: Request, res: Response) => {
  const query = parseWithSchema(getVersionQuerySchema, req.query);
  const version = await getLatestVersion(query);

  res.json({ success: true, data: toResponsePayload(version) });
});

export const postVersion = asyncHandler(async (req: Request, res: Response) => {
  const payload = parseWithSchema(createVersionSchema, req.body);
  const version = await recordVersion(payload);

  res.status(201).json({ success: true, data: toResponsePayload(version) });
});

export const getVersionHistoryHandler = asyncHandler(async (req: Request, res: Response) => {
  const query = parseWithSchema(listVersionHistoryQuerySchema, req.query);
  const history = await getVersionHistory(query);

  res.json({
    success: true,
    data: history.items.map(toResponsePayload),
    pagination: {
      nextCursor: history.nextCursor ?? null,
      hasMore: Boolean(history.nextCursor)
    }
  });
});