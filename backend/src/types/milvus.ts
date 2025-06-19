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