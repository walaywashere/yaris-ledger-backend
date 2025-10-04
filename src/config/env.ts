import { config } from 'dotenv';
import { z } from 'zod';

config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  APP_TIMEZONE: z.string().default('Asia/Manila'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value: string) =>
      value
        .split(',')
        .map((origin: string) => origin.trim())
        .filter((origin: string) => origin.length > 0)
    )
});

export type EnvConfig = ReturnType<typeof createEnvConfig>;

export const createEnvConfig = () => {
  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Environment validation failed:', result.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration');
  }

  const { CORS_ORIGINS, ...rest } = result.data;

  return {
    ...rest,
    corsOrigins: CORS_ORIGINS
  };
};