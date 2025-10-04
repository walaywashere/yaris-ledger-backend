import { config } from 'dotenv';
import { z } from 'zod';

config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  APP_TIMEZONE: z.string().default('Asia/Manila'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value: string) =>
      value
        .split(',')
        .map((origin: string) => origin.trim())
        .filter((origin: string) => origin.length > 0)
    ),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      if (typeof value === 'boolean') return value;
      return value === 'true';
    })
});

export type EnvConfig = {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  APP_TIMEZONE: string;
  corsOrigins: string[];
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
  refreshTokenTtlDays: number;
  cookieDomain?: string;
  cookieSecure: boolean;
};

let cachedEnv: EnvConfig | null = null;

export const createEnvConfig = (): EnvConfig => {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Environment validation failed:', result.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration');
  }

  const {
    CORS_ORIGINS,
    JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN,
    REFRESH_TOKEN_TTL_DAYS,
    COOKIE_DOMAIN,
    COOKIE_SECURE,
    ...rest
  } = result.data;

  cachedEnv = {
    NODE_ENV: rest.NODE_ENV,
    PORT: rest.PORT,
    DATABASE_URL: rest.DATABASE_URL,
    JWT_ACCESS_SECRET: rest.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: rest.JWT_REFRESH_SECRET,
    APP_TIMEZONE: rest.APP_TIMEZONE,
    corsOrigins: CORS_ORIGINS,
    jwtAccessExpiresIn: JWT_ACCESS_EXPIRES_IN,
    jwtRefreshExpiresIn: JWT_REFRESH_EXPIRES_IN,
    refreshTokenTtlDays: REFRESH_TOKEN_TTL_DAYS,
    cookieDomain: COOKIE_DOMAIN,
    cookieSecure: COOKIE_SECURE ?? rest.NODE_ENV === 'production'
  };

  return cachedEnv;
};