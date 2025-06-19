import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    if (schema) {
      const result = schema.parse(req.body);
      req.body = result;
    }
    next();
  } catch (err) {
    next(err);
  }
};