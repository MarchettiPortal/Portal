// src/types/csvSLA.ts
export interface ParsedRow {
  CÓDIGO: number;
  DATA_CRIACAO_SQL: string;
  HORA_CRIACAO_SQL: string;
  MES_CRIACAO_SQL: string;
  ANO_CRIACAO_SQL: number;
  DATA_SOLUCAO_SQL: string;
  HORA_SOLUCAO_SQL: string;
  MES_SOLUCAO_SQL: string;
  ANO_SOLUCAO_SQL: number;
  TICKETS_ABERTOS: string;
  SLA: string;
  PRIORIDADE: string;
  STATUS: string;
  MESA_TRABALHO: string;
  TECNICO: string;
  SETOR: string;
  CATEGORIA: string;
  SUBCATEGORIA: string;
  LOCAL: string;
  TIPO_ATENDIMENTO?: string | null;
  NOTA_AVALIACAO?: string | null;
  TICKETS_REABERTOS?: string | null;
  DESCRICAO_AVALIACAO?: string | null;
  NOME_OPERADOR: string;
  DESCRICAO?: string | null;
  ASSUNTO?: string | null;
  DESC_PAUSA?: string | null;
  USUARIO_CHAMADO?: string | null;
}
