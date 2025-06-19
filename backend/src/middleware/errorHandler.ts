import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

/**
 * Middleware global para tratamento de erros.
 */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error(String(err));

  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation error', details: err.errors });
    return;
  }
    res.status(500).json({ error: 'Internal server error' })
    return;
}