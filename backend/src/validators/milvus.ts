import { z } from 'zod';

/**
 * Schema para criação de um chamado.
 */
export const createChamadoSchema = z.object({
  CODIGO: z.string().min(1),
  PRIORIDADE: z.string().optional(),
  NOTA_AVALIACAO: z.string().optional(),
});

/**
 * Schema para atualização de um chamado.
 */
export const updateChamadoSchema = z.object({
  PRIORIDADE: z.string().optional(),
  NOTA_AVALIACAO: z.string().optional(),
});

/**
 * Validação para params com código de chamado.
 */
export const codigoParamSchema = z.object({
  codigo: z.string().min(1),
  CODIGO: z.string().optional(),
});