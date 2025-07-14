// src/services/milvusSchedulerService.ts
import { pool } from '../../config/Global/db.config.js'
import axios from 'axios'
import { config } from '../../config/Global/global.config.js'
import { logger } from '../../utils/logger'



let intervalId: NodeJS.Timeout | null = null

/**
 * Verifica no banco se o agendador automático está habilitado.
 *
 * @returns `true` quando o agendador deve estar ativo.
 */
export async function getAgendadorStatus(): Promise<boolean> {
  const { rows } = await pool.query<{ valor: boolean }>(
    `SELECT valor
       FROM configuracoes_agendador
      WHERE chave = $1`,
    ['SLArefreshAutomatico']
  )
  // Se não existir registro, considera inativo
  return rows[0]?.valor === true
}


/**
 * Atualiza no banco de dados o estado do agendador.
 *
 * @param ativo Novo estado desejado.
 */
export async function setAgendadorStatus(ativo: boolean): Promise<void> {
  logger.info('agendador Iniciado')
  await pool.query(
    `UPDATE configuracoes_agendador
        SET valor = $1
      WHERE chave = $2`,
    [ativo, 'SLArefreshAutomatico']
  )
}


/**
 * Executa o refresh se estiver em horário de expediente
 *
 */
async function executarRefreshSeHorarioPermitido() {
  const agora = new Date()
  const dia = agora.getDay()             // 0=Dom,1=Seg...6=Sáb
  const hora = agora.getHours() + agora.getMinutes() / 60
  const expediente = dia >= 1 && dia <= 5 && hora >= 7.5 && hora < 17.5

  try {
    await axios.get(`${config.URL_API_MILVUS}/SLArefreshAutomatico`)
    logger.info(`[${new Date().toISOString()}] Atualização realizada.`)
  } catch (err) {
    logger.error(
      `[erro ao atualizar] ${err instanceof Error ? err.message : String(err)}`

    )
  }

  // 2 min dentro do expediente, 2 h fora
  const proximo = expediente ? 2 * 60 * 1000 : 2 * 60 * 60 * 1000
  iniciarAgendador(proximo)
}


/**
 * Inicia o agendador com um atraso opcional.
 * Reinicia o timer caso já esteja ativo.
 *
 * @param delay Tempo em milissegundos para a primeira execução.
 */
export async function iniciarAgendador(delay = 0) {
  if (intervalId) clearTimeout(intervalId)
  if (!(await getAgendadorStatus())) return
  intervalId = setTimeout(executarRefreshSeHorarioPermitido, delay)
}


/**
 * Interrompe o agendador limpando o temporizador ativo.
 */
export function pararAgendador() {
   if (intervalId) {
    clearTimeout(intervalId)
    intervalId = null
    //logger.log('🛑 Agendador parado.')
  }
}