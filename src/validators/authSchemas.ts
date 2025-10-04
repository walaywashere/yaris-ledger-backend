import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Username or email is required').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(256)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;