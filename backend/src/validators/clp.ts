import { z } from 'zod';

/** Schema para alteração de configuração do CLP. */
export const setClpConfigSchema = z.object({
  ip: z.string().min(1),
  userID: z.string().min(1)
});

/** Schema para criação de um novo CLP. */
export const createClpSchema = z.object({
  nome: z.string().min(1),
  ip: z.string().min(1),
  ativo: z.boolean().optional(),
  sistema_clp: z.string().min(1)
});

/** Schema para atualização parcial do CLP. */
export const updateClpSchema = createClpSchema.partial();