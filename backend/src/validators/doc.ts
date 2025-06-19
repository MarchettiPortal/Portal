import { z } from 'zod';

/**
 * Schema para criação de uma Section de documentação.
 */
export const createSectionSchema = z.object({
  title: z.string().min(1),
  display_order: z.coerce.number(),
});

/**
 * Schema para edição de uma Section.
 */
export const editSectionSchema = createSectionSchema.partial().extend({
  id: z.coerce.number(),
});

/**
 * Validação do parâmetro ID na rota.
 */
export const idParamSchema = z.object({
  id: z.coerce.number(),
});

/**
 * Schema para criação de uma rota/endpoint da documentação.
 */
export const createRouteSchema = z.object({
  section_id: z.coerce.number(),
  method: z.string().min(1),
  url: z.string().min(1),
  description: z.string().optional(),
  display_order: z.coerce.number(),
});

/**
 * Schema para edição de uma rota/endpoint.
 */
export const editRouteSchema = createRouteSchema.partial().extend({
  id: z.coerce.number(),
});