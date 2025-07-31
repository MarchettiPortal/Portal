import { pool } from '../../config/Global/db.config.js'

/** Retorna todos os chamados não finalizados. */
export const consultarChamados = async () => {
  const { rows } = await pool.query(`
    SELECT codigo, assunto, descricao, usuario_chamado, status, prioridade, mesa_trabalho, data_criacao, setor, nome_operador, local, categoria, tipo_atendimento 
      FROM log_milvus_chamados 
      WHERE status != 'Finalizado'
      ORDER BY data_criacao DESC
  `)
  return rows
}

/** Agrupa quantidade de chamados por setor. */
export const contarChamadosPorSetor = async () => {
  const { rows } = await pool.query(`
    SELECT setor,
           COUNT(*) AS total
      FROM log_milvus_chamados
  GROUP BY setor
     ORDER BY total DESC
  `)
  return rows
}

/** Agrupa quantidade de chamados por operador. */
export const contarChamadosPorOperador = async () => {
  const { rows } = await pool.query(`
    SELECT nome_operador AS operador,
           COUNT(*)      AS total
      FROM log_milvus_chamados
  GROUP BY nome_operador
     ORDER BY total DESC
  `)
  return rows
}

/** Agrupa quantidade de chamados por prioridade. */
export const contarChamadosPorPrioridade = async () => {
  const { rows } = await pool.query(`
    SELECT prioridade,
           COUNT(*) AS total
      FROM log_milvus_chamados
  GROUP BY prioridade
     ORDER BY total DESC
  `)
  return rows
}

/** Contagem de chamados dentro ou fora do SLA. */
export const contarChamadosPorSLA = async () => {
  const { rows } = await pool.query(`
    SELECT CASE
             WHEN sla <= 15 THEN 'Dentro do SLA'
             ELSE 'Fora do SLA'
           END AS status,
           COUNT(*) AS total
      FROM log_milvus_chamados
     WHERE sla IS NOT NULL
  GROUP BY status
  `)
  return rows
}

/** Agrupa quantidade de chamados por local. */
export const contarChamadosPorLocal = async () => {
  const { rows } = await pool.query(`
    SELECT local,
           COUNT(*) AS total
      FROM log_milvus_chamados
  GROUP BY local
     ORDER BY total DESC
  `)
  return rows
}

/** Contagem de chamados reabertos. */
export const contarChamadosReabertos = async () => {
  const { rows } = await pool.query(`
    SELECT tickets_reabertos::TEXT AS status,
           COUNT(*)                AS total
      FROM log_milvus_chamados
     WHERE tickets_reabertos IS NOT NULL
  GROUP BY tickets_reabertos
  `)
  return rows
}

/**
 * Agrupa a quantidade de chamados por tipo de atendimento para um ano.
 */
export const contarChamadosPorTipoAtendimento = async (ano: number) => {
  const { rows } = await pool.query(
    `
    SELECT tipo_atendimento,
           COUNT(*) AS total
      FROM log_milvus_chamados
     WHERE ano_criacao = $1
       AND tipo_atendimento IN ('In Loco', 'Remoto', 'Pedido de Compras', 'Terceirizado', '')
  GROUP BY tipo_atendimento
     ORDER BY total DESC
  `,
    [ano]
  )
  return rows
}