import { parentPort } from 'worker_threads';
import { slaRefreshAutomatico } from '../services/Milvus/csvSLA.AutoRefresh.service';

/**
 * Executa o worker responsável por disparar a atualização automática do SLA.
 * Envia mensagens de sucesso ou erro para o processo pai.
 */
async function run() {
  try {
    const resultado = await slaRefreshAutomatico();
    parentPort?.postMessage({ status: 'success', resultado });
  } catch (error) {
    parentPort?.postMessage({
      status: 'error',
      error: error instanceof Error ? error.message : 'Erro desconhecido no worker',
    });
  }
}

run();