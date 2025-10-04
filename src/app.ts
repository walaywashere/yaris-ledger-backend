import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';

import { createEnvConfig } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.js';
import { customersRouter } from './routes/customers.js';
import { healthRouter } from './routes/health.js';
import { locationsRouter } from './routes/locations.js';

const env = createEnvConfig();

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/locations', locationsRouter);
  app.use('/api/customers', customersRouter);

  app.get('/api/version', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'yaris-ledger-backend-rewrite' });
  });

  app.use(errorHandler);

  return app;
};