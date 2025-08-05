import { z } from 'zod';

/** Dados mínimos para criação de usuário via AD. */
export const createUserSchema = z.object({
  nome: z.string().min(1).optional(),
}).passthrough();