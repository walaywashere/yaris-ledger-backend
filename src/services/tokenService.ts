import crypto from 'crypto';

import type { RefreshToken, User } from '@prisma/client';
import type { CookieOptions } from 'express';
import jwt, { type JwtPayload, type Secret, type SignOptions } from 'jsonwebtoken';

import { createEnvConfig } from '../config/env.js';
import { prisma } from '../prisma/client.js';
import { AuthenticationError } from '../utils/errors.js';

const env = createEnvConfig();

const REFRESH_TOKEN_MAX_AGE_MS = env.refreshTokenTtlDays * 24 * 60 * 60 * 1000;

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: 'lax',
  path: '/',
  maxAge: REFRESH_TOKEN_MAX_AGE_MS
};

export const refreshTokenCookieOptions: CookieOptions = env.cookieDomain
  ? { ...baseCookieOptions, domain: env.cookieDomain }
  : baseCookieOptions;

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const computeRefreshExpiry = () => new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);

const accessTokenSecret: Secret = env.JWT_ACCESS_SECRET;
const accessTokenOptions: SignOptions = {
  expiresIn: env.jwtAccessExpiresIn as SignOptions['expiresIn']
};

export const generateAccessToken = (user: Pick<User, 'id' | 'role'>) =>
  jwt.sign({ sub: user.id, role: user.role }, accessTokenSecret, accessTokenOptions);

const createRefreshTokenRecord = async (userId: string) => {
  const token = crypto.randomBytes(48).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = computeRefreshExpiry();

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt
    }
  });

  return { token, expiresAt };
};

const findValidRefreshToken = async (token: string): Promise<RefreshToken & { user: User }> => {
  const tokenHash = hashToken(token);
  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!existing || existing.revokedAt || existing.expiresAt.getTime() <= Date.now()) {
    throw new AuthenticationError('Invalid refresh token');
  }

  if (!existing.user.isActive) {
    throw new AuthenticationError('User account is inactive');
  }

  return existing;
};

export const issueTokensForUser = async (user: User) => {
  if (!user.isActive) {
    throw new AuthenticationError('User account is inactive');
  }

  const accessToken = generateAccessToken(user);
  const refresh = await createRefreshTokenRecord(user.id);

  return {
    accessToken,
    refreshToken: refresh.token,
    refreshTokenExpiresAt: refresh.expiresAt
  };
};

export const rotateRefreshToken = async (token: string) => {
  const existing = await findValidRefreshToken(token);

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: {
      revokedAt: new Date()
    }
  });

  const refresh = await createRefreshTokenRecord(existing.userId);
  const accessToken = generateAccessToken(existing.user);

  return {
    user: existing.user,
    accessToken,
    refreshToken: refresh.token,
    refreshTokenExpiresAt: refresh.expiresAt
  };
};

export const revokeRefreshToken = async (token: string) => {
  const tokenHash = hashToken(token);

  await prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
};

export const revokeAllRefreshTokensForUser = async (userId: string) => {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
};

export type AccessTokenPayload = JwtPayload & {
  sub: string;
  role: User['role'];
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    const payload = jwt.verify(token, accessTokenSecret) as AccessTokenPayload | string;

    if (typeof payload === 'string' || !payload.sub || !payload.role) {
      throw new Error('Invalid access token payload');
    }

    return payload;
  } catch (error) {
    throw new AuthenticationError('Invalid access token', error);
  }
};