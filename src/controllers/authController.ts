import type { Request, Response } from 'express';

import { createEnvConfig } from '../config/env.js';
import { loginWithPassword, refreshSession, logoutSession } from '../services/authService.js';
import { REFRESH_TOKEN_COOKIE_NAME, refreshTokenCookieOptions } from '../services/tokenService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticationError } from '../utils/errors.js';
import { parseWithSchema } from '../utils/validation.js';
import { loginSchema, refreshSchema } from '../validators/authSchemas.js';

const env = createEnvConfig();

const extractIdentifier = (body: Request['body']) =>
  (typeof body?.identifier === 'string'
    ? body.identifier
    : typeof body?.username === 'string'
      ? body.username
      : typeof body?.email === 'string'
        ? body.email
        : '');

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = parseWithSchema(loginSchema, {
    identifier: extractIdentifier(req.body),
    password: req.body?.password
  });

  const result = await loginWithPassword(parsed.identifier, parsed.password);

  res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, refreshTokenCookieOptions);

  res.json({
    success: true,
    user: result.user,
    accessToken: result.accessToken,
    accessTokenExpiresIn: env.jwtAccessExpiresIn,
    refreshTokenExpiresAt: result.refreshTokenExpiresAt.toISOString()
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const incomingToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] ?? req.body?.refreshToken;

  const parsed = parseWithSchema(refreshSchema, { refreshToken: incomingToken });

  const result = await refreshSession(parsed.refreshToken);

  res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, refreshTokenCookieOptions);

  res.json({
    success: true,
    user: result.user,
    accessToken: result.accessToken,
    accessTokenExpiresIn: env.jwtAccessExpiresIn,
    refreshTokenExpiresAt: result.refreshTokenExpiresAt.toISOString()
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const incomingToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] ?? req.body?.refreshToken;

  if (incomingToken) {
    await logoutSession(incomingToken);
  }

  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    ...refreshTokenCookieOptions,
    maxAge: 0
  });

  res.json({ success: true });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.tokenPayload) {
    throw new AuthenticationError('Unauthenticated');
  }

  res.json({
    success: true,
    user: req.user,
    token: req.tokenPayload
  });
});