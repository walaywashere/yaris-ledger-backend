import type { RequestHandler } from 'express';

import { getUserFromAccessToken } from '../services/authService.js';
import { verifyAccessToken } from '../services/tokenService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';

const extractBearerToken = (authorization?: string) => {
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token.trim();
};

export const requireAuth: RequestHandler = asyncHandler(async (req, _res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    throw new AuthenticationError('Missing access token');
  }

  const payload = verifyAccessToken(token);
  const user = await getUserFromAccessToken(token, payload);

  req.tokenPayload = payload;
  req.user = user;
  next();
});

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }

  if (req.user.role !== 'ADMIN') {
    return next(new AuthorizationError('Administrator privileges required'));
  }

  return next();
};