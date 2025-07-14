import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware genérico para validar dados de requisição usando Zod.
 * @param schema Esquema Zod a ser aplicado.
 * @param property Qual parte da requisição deve ser validada.
 */
export const validate = (schema: ZodSchema, property: 'body' | 'params' | 'query' = 'body') => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result = schema.safeParse(req[property]);
  if (!result.success) {
    res.status(400).json({ error: 'Validation error', details: result.error.errors });
    return;
  }
  (req as any)[property] = result.data;
  next();
};