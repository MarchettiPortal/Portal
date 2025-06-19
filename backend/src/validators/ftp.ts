import { z } from 'zod';

/**
 * Schema para renomear arquivos via FTP.
 */
export const renameFileSchema = z.object({
  antigoNome: z.string().min(1),
  novoNome: z.string().min(1),
  clp: z.string().optional(),
});

/** Parâmetro para nome de arquivo utilizado em rotas. */
export const fileParamSchema = z.object({
  nomeArquivo: z.string().min(1),
});