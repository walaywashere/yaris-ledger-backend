import type { ErrorRequestHandler } from 'express';

import { AppError } from '../utils/errors.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details ?? null
    });
  }

  console.error('Unhandled error', err);

  return res.status(500).json({
    error: 'Internal server error'
  });
};