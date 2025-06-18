import { MudancaDetectada } from "./common";

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