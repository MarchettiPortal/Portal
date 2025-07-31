// src/services/Milvus.csvSLA.DB.service.ts
import { pool } from '../../config/Global/db.config'
import { Ticket } from '../../types/milvus'
import { logger } from '../../utils/logger'


/**
 * Insere ou atualiza um ticket usando INSERT ... ON CONFLICT
 */
export async function upsertTicket(raw: Record<string, any>) {
  // Mapeia do CSV (com chaves maiúsculas/acentos) para o nosso tipo
  const t: Ticket = {
    codigo: Number(raw['CÓDIGO']),
    data_criacao: raw['DATA_CRIACAO_SQL'],
    hora_solucao: raw['HORA_SOLUCAO_SQL'],
    hora_criacao: raw['HORA_CRIACAO_SQL'],
    mes_criacao: raw['MES_CRIACAO_SQL'],
    ano_criacao: Number(raw['ANO_CRIACAO_SQL']),
    mes_solucao: raw['MES_SOLUCAO_SQL'],
    ano_solucao: Number(raw['ANO_SOLUCAO_SQL']),
    data_solucao: raw['DATA_SOLUCAO_SQL'],
    prioridade: raw['PRIORIDADE'],
    setor: raw['SETOR'],
    categoria: raw['CATEGORIA'],
    subcategoria: raw['SUBCATEGORIA'],
    local: raw['LOCAL'],
    tickets_abertos: raw['TICKETS_ABERTOS'],
    sla: raw['SLA'],
    tipo_atendimento: raw['TIPO_ATENDIMENTO'] ?? null,
    nota_avaliacao: raw['NOTA_AVALIACAO'] ?? null,
    tickets_reabertos: raw['TICKETS_REABERTOS'] ?? null,
    descricao_avaliacao: raw['DESCRICAO_AVALIACAO'] ?? null,
    nome_operador: raw['NOME_OPERADOR'],
    status: raw['STATUS'],
    descricao: raw['DESCRICAO'] ?? null,
    assunto: raw['ASSUNTO'] ?? null,
    desc_pausa: raw['DESC_PAUSA'] ?? null,
    usuario_chamado: raw['USUARIO_CHAMADO'] ?? null,
    mesa_trabalho: raw['MESA_TRABALHO'],
  }

  const sql = `
    INSERT INTO log_milvus_chamados (
      codigo, data_criacao, hora_solucao, hora_criacao,
      mes_criacao, ano_criacao, mes_solucao, ano_solucao,
      data_solucao, prioridade, setor, categoria, subcategoria,
      local, tickets_abertos, sla, tipo_atendimento,
      nota_avaliacao, tickets_reabertos, descricao_avaliacao,
      nome_operador, status, descricao, assunto,
      desc_pausa, usuario_chamado, mesa_trabalho
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11, $12, $13, $14, $15, $16,
      $17, $18, $19, $20, $21, $22, $23, $24,
      $25, $26, $27
    )
    ON CONFLICT (codigo) DO UPDATE SET
      data_criacao        = EXCLUDED.data_criacao,
      hora_solucao        = EXCLUDED.hora_solucao,
      hora_criacao        = EXCLUDED.hora_criacao,
      mes_criacao         = EXCLUDED.mes_criacao,
      ano_criacao         = EXCLUDED.ano_criacao,
      mes_solucao         = EXCLUDED.mes_solucao,
      ano_solucao         = EXCLUDED.ano_solucao,
      data_solucao        = EXCLUDED.data_solucao,
      prioridade          = EXCLUDED.prioridade,
      setor               = EXCLUDED.setor,
      categoria           = EXCLUDED.categoria,
      subcategoria        = EXCLUDED.subcategoria,
      local               = EXCLUDED.local,
      tickets_abertos     = EXCLUDED.tickets_abertos,
      sla                 = EXCLUDED.sla,
      tipo_atendimento    = EXCLUDED.tipo_atendimento,
      nota_avaliacao      = EXCLUDED.nota_avaliacao,
      tickets_reabertos   = EXCLUDED.tickets_reabertos,
      descricao_avaliacao = EXCLUDED.descricao_avaliacao,
      nome_operador       = EXCLUDED.nome_operador,
      status              = EXCLUDED.status,
      descricao           = EXCLUDED.descricao,
      assunto             = EXCLUDED.assunto,
      desc_pausa          = EXCLUDED.desc_pausa,
      usuario_chamado     = EXCLUDED.usuario_chamado,
      mesa_trabalho       = EXCLUDED.mesa_trabalho
  `

  const params = [
    t.codigo, t.data_criacao, t.hora_solucao, t.hora_criacao,
    t.mes_criacao, t.ano_criacao, t.mes_solucao, t.ano_solucao,
    t.data_solucao, t.prioridade, t.setor, t.categoria, t.subcategoria,
    t.local, t.tickets_abertos, t.sla, t.tipo_atendimento,
    t.nota_avaliacao, t.tickets_reabertos, t.descricao_avaliacao,
    t.nome_operador, t.status, t.descricao, t.assunto,
    t.desc_pausa, t.usuario_chamado, t.mesa_trabalho
  ]

  try {
    // Usa pool.query diretamente, sem .connect()
    await pool.query(sql, params)
  } catch (err) {
    // Jogar o erro para a camada superior, se precisar abortar o pipeline
    logger.error('Erro no upsertTicket:', err)
    throw err
  }
}
