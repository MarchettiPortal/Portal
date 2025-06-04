import { parentPort } from 'worker_threads';
import { slaRefreshAutomatico } from '../services/Milvus/Milvus.csvSLA.AutoRefresh.service';

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