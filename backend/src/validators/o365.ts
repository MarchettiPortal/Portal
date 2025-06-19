import { z } from 'zod';

/** Parametro ID genérico */
export const idParamSchema = z.object({
  id: z.coerce.number(),
});

/** Parametro campo de usuários */
export const campoParamSchema = z.object({
  campo: z.string().min(1),
});

/** Dados de permissão de rota */
export const permissaoSchema = z.object({
  rota: z.string().min(1),
  nome_visivel: z.string().min(1),
  grupo_pai: z.coerce.number().optional(),
});

/** Associação grupo/permissão/usuario */
export const grupoPermissaoSchema = z.object({
  grupo_id: z.coerce.number(),
  permissao_id: z.coerce.number(),
  user_id: z.coerce.number().nullable().optional(),
});