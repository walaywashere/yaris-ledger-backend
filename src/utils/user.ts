import type { User } from '@prisma/client';

export type SafeUser = Pick<User, 'id' | 'username' | 'fullName' | 'role' | 'email' | 'isActive' | 'createdAt' | 'updatedAt'>;

export const toSafeUser = (user: User): SafeUser => ({
  id: user.id,
  username: user.username,
  fullName: user.fullName,
  role: user.role,
  email: user.email,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});