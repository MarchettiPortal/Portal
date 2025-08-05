import { pool } from '../../config/Global/db.config';
import { logger } from '../../utils/logger';
import { Worker } from 'worker_threads';
import path from 'path';

let intervalId: NodeJS.Timeout | null = null;

const isProd = process.env.NODE_ENV === 'production';
/**
 * Verifica no banco se o agendador automático está habilitado.
 *
 * @returns `true` quando o agendador deve estar ativo.
 */
export async function getAgendadorStatus(): Promise<boolean> {
  const { rows } = await pool.query<{ valor: boolean }>(
    `SELECT valor
       FROM scheduler_refresh_status
      WHERE chave = $1`,
    ['SLArefreshAutomatico']
  );
  // Se não existir registro, considera inativo
  return rows[0]?.valor === true;
}

/**
 * Atualiza no banco de dados o estado do agendador.
 *
 * @param ativo Novo estado desejado.
 */
export async function setAgendadorStatus(ativo: boolean): Promise<void> {
  if (ativo !== false) {
    logger.info('Agendador Iniciado');
  } else {
    logger.info('Agendador Parado');
  }

  await pool.query(
    `UPDATE scheduler_refresh_status
        SET valor = $1
      WHERE chave = $2`,
    [ativo, 'SLArefreshAutomatico']
  );
}

/**
 * Executa o refresh se estiver em horário de expediente.
 */
async function executarRefreshSeHorarioPermitido() {
  const agora = new Date();
  const dia = agora.getDay();
  const hora = agora.getHours() + agora.getMinutes() / 60;
  const expediente = dia >= 1 && dia <= 5 && hora >= 7.5 && hora < 17.5;

  try {
    const workerPath = isProd
      ? path.resolve(__dirname, '../../dist/workers/Milvus.SLA.Refresh.worker.js')
      : path.resolve(__dirname, '../workers/Milvus.SLA.Refresh.worker.ts');

    const worker = new Worker(workerPath, {
      execArgv: isProd ? [] : ['--require', 'ts-node/register'],
    });

    worker.on('error', (error) => {
      logger.error(`[Worker SLA] Erro fatal: ${error.message}`);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        logger.warn(`[Worker SLA] Saiu com código ${code}`);
      }
    });
  } catch (err) {
    logger.error(`[erro ao iniciar worker SLA] ${err instanceof Error ? err.message : String(err)}`);
  }

  const proximo = expediente ? 2 * 60 * 1000 : 2 * 60 * 60 * 1000;
  iniciarAgendador(proximo);
}
/**
 * Inicia o agendador com um atraso opcional.
 * Reinicia o timer caso já esteja ativo.
 *
 * @param delay Tempo em milissegundos para a primeira execução.
 */
export async function iniciarAgendador(delay = 0) {
  if (intervalId) clearTimeout(intervalId);
  if (!(await getAgendadorStatus())) return;
  intervalId = setTimeout(executarRefreshSeHorarioPermitido, delay);
}

/**
 * Interrompe o agendador limpando o temporizador ativo.
 */
export function pararAgendador() {
  if (intervalId) {
    clearTimeout(intervalId);
    intervalId = null;
  }
}
