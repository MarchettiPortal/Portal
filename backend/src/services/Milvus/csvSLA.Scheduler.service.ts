// src/services/milvusSchedulerService.ts
import { pool } from '../../config/Global/db.config.js'
import axios from 'axios'
import { config } from '../../config/Global/global.config.js'
import { logger } from '../../utils/logger'



let intervalId: NodeJS.Timeout | null = null

 // Retorna true se o agendador estiver ativo (coluna valor = true)
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


// Atualiza o status do agendador (valor booleano)
export async function setAgendadorStatus(ativo: boolean): Promise<void> {
  logger.info('agendador Iniciado')
  await pool.query(
    `UPDATE configuracoes_agendador
        SET valor = $1
      WHERE chave = $2`,
    [ativo, 'SLArefreshAutomatico']
  )
}


//Executa o refresh se estiver em horário de expediente
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


// Inicia o agendador com delay (ms). Se já estiver ativo, reinicia o timer.

export async function iniciarAgendador(delay = 0) {
  if (intervalId) clearTimeout(intervalId)
  if (!(await getAgendadorStatus())) return
  intervalId = setTimeout(executarRefreshSeHorarioPermitido, delay)
}

 // Para o agendador (limpa o timer)
 
export function pararAgendador() {
   if (intervalId) {
    clearTimeout(intervalId)
    intervalId = null
    //console.log('🛑 Agendador parado.')
  }
}