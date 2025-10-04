import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { createEnvConfig } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.js';
import { customersRouter } from './routes/customers.js';
import { healthRouter } from './routes/health.js';
import { locationsRouter } from './routes/locations.js';
import { reportsRouter } from './routes/reports.js';
import { salesRouter } from './routes/sales.js';
import { settingsRouter } from './routes/settings.js';
import { versionRouter } from './routes/version.js';

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
  app.use('/api/sales', salesRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/reports', reportsRouter);
  app.use('/api/version', versionRouter);

  app.use(errorHandler);

  return app;
};