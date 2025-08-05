import { z } from 'zod';

/** Validação simples para rotas que utilizam apenas um ID numérico. */
export const idParamSchema = z.object({
  id: z.coerce.number(),
});