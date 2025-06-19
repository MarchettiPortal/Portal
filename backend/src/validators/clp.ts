import { z } from 'zod';

export const setClpConfigSchema = z.object({
  ip: z.string().min(1),
  userID: z.string().min(1)
});

export const createClpSchema = z.object({
  nome: z.string().min(1),
  ip: z.string().min(1),
  ativo: z.boolean().optional(),
  sistema_clp: z.string().min(1)
});

export const updateClpSchema = createClpSchema.partial();