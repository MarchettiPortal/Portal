import { MudancaDetectada } from './common';

export interface Ticket {
  codigo: number;
  data_criacao: string;
  hora_solucao: string;
  hora_criacao: string;
  mes_criacao: string;
  ano_criacao: number;
  mes_solucao: string;
  ano_solucao: number;
  data_solucao: string;
  prioridade: string;
  setor: string;
  categoria: string;
  subcategoria: string;
  local: string;
  tickets_abertos: string;
  sla: string;
  tipo_atendimento: string | null;
  nota_avaliacao: string | null;
  tickets_reabertos: string | null;
  descricao_avaliacao: string | null;
  nome_operador: string;
  status: string;
  descricao: string | null;
  assunto: string | null;
  desc_pausa: string | null;
  usuario_chamado: string | null;
  mesa_trabalho: string;
}

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

export interface SLARefreshStatus {
    enabled: boolean;
    lastUpdate: Date | null;
    nextUpdate: Date | null;
    mode: 'business' | 'after-hours';
}

export type Prioridade = 'Baixo' | 'Médio' | 'Alto' | 'Crítico' | 'Não Possui' | "Planejado";
export type StatusChamado = 'A fazer' | 'Em Andamento' | 'Pausado' | 'Finalizado' | 'Atendendo' | 'Não Possui' | 'Reaberto';

export interface Chamado {
    CODIGO: string;
    CATEGORIA: string;
    SUBCATEGORIA: string;
    LOCAL: string;
    SETOR: string;
    MES_CRIACAO: string;
    ANO_CRIACAO: number;
    DATA_CRIACAO: string;
    MES_SOLUCAO: string;
    ANO_SOLUCAO: number;
    DATA_SOLUCAO: string;
    SLA: number;
    TICKETS_ABERTOS: string;
    PRIORIDADE: string;
    NOME_OPERADOR: string;
    HORA_SOLUCAO: string;
    HORA_CRIACAO: string;
    NOTA_AVALIACAO: number;
    TICKETS_REABERTOS: string;
    DESCRICAO_AVALIACAO: string;
    TIPO_ATENDIMENTO: string;
  }
export interface ChamadoAPI {
  codigo: string
  prioridade: string | null
  status:    string | null
  mesa_trabalho: string
  tecnico:       string
}

export interface ChamadoBanco {
    codigo: string | number;
    prioridade: Prioridade;
    status: StatusChamado;
    mesa_trabalho: string;
    tecnico: string;

}

export interface ResultadoAtualizacao {
    message: string;
    changes?: MudancaDetectada[];
    needsUpdate?: boolean;
}