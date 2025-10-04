import cors from 'cors';
import express, { Request, Response } from 'express';
import helmet from 'helmet';

import { createEnvConfig } from './config/env.js';
import { healthRouter } from './routes/health.js';

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

  app.use('/api/health', healthRouter);

  app.get('/api/version', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'yaris-ledger-backend-rewrite' });
  });

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};