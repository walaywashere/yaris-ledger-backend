import http from 'http';

import { createApp } from './app.js';
import { createEnvConfig } from './config/env.js';

const env = createEnvConfig();
const app = createApp();

const server = http.createServer(app);

server.listen(env.PORT, () => {
  console.log(`🚀 Yaris Ledger backend listening on port ${env.PORT} (${env.NODE_ENV})`);
});

const shutdown = (signal: NodeJS.Signals) => {
  console.info(`Received ${signal}. Gracefully shutting down...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);