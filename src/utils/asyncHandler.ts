import type { NextFunction, Request, Response } from 'express';
import type { RequestHandler } from 'express-serve-static-core';

export const asyncHandler = (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};