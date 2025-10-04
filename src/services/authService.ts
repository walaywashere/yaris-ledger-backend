import { prisma } from '../prisma/client.js';
import { AuthenticationError, NotFoundError } from '../utils/errors.js';
import { verifyPassword } from '../utils/password.js';
import { toSafeUser } from '../utils/user.js';
import type { SafeUser } from '../utils/user.js';

import {
  issueTokensForUser,
  rotateRefreshToken,
  revokeAllRefreshTokensForUser,
  revokeRefreshToken,
  type AccessTokenPayload,
  verifyAccessToken
} from './tokenService.js';

type LoginResult = {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};

type RefreshResult = LoginResult;

export const loginWithPassword = async (usernameOrEmail: string, password: string): Promise<LoginResult> => {
  const identifier = usernameOrEmail.trim();

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: { equals: identifier, mode: 'insensitive' } },
        { email: { equals: identifier, mode: 'insensitive' } }
      ]
    }
  });

  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  if (!user.isActive) {
    throw new AuthenticationError('Account is disabled');
  }

  const validPassword = await verifyPassword(password, user.passwordHash);

  if (!validPassword) {
    throw new AuthenticationError('Invalid credentials');
  }

  const tokens = await issueTokensForUser(user);

  return {
    user: toSafeUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    refreshTokenExpiresAt: tokens.refreshTokenExpiresAt
  };
};

export const refreshSession = async (token: string): Promise<RefreshResult> => {
  if (!token) {
    throw new AuthenticationError('Missing refresh token');
  }

  const { user, accessToken, refreshToken, refreshTokenExpiresAt } = await rotateRefreshToken(token);

  return {
    user: toSafeUser(user),
    accessToken,
    refreshToken,
    refreshTokenExpiresAt
  };
};

export const logoutSession = async (token: string) => {
  if (!token) {
    return;
  }

  await revokeRefreshToken(token);
};

export const logoutAllSessions = async (userId: string) => {
  await revokeAllRefreshTokensForUser(userId);
};

export const getUserFromAccessToken = async (token: string, payload?: AccessTokenPayload): Promise<SafeUser> => {
  const resolvedPayload = payload ?? verifyAccessToken(token);

  const user = await prisma.user.findUnique({
    where: { id: resolvedPayload.sub }
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.isActive) {
    throw new AuthenticationError('Account is disabled');
  }

  return toSafeUser(user);
};

export type { LoginResult, RefreshResult, AccessTokenPayload };