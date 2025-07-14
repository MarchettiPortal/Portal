import { Request, Response } from 'express';
import path from 'path';
import { Worker } from 'worker_threads';
import { logger } from '../../utils/logger';

/**
 * Triggers the SLA refresh worker asynchronously.
 *
 * @param _req Express request object (unused).
 * @param res Express response returning the acceptance of the job.
 * @returns Promise resolving when the worker has been spawned.
 */
export async function getRefreshAuto(req: Request, res: Response) {
  try {

    const workerPath = path.resolve(__dirname, '../../workers/Milvus.SLA.Refresh.worker.js');
    const worker = new Worker(workerPath);
    
    worker.on('message', (msg) => {
      if (msg.status === 'success') {
        logger.info('✅ Worker finalizou com sucesso.');
      } else {
        logger.error(`❌ Erro no worker: ${msg.error}`);
      }
    });

    worker.on('error', (err) => {
      logger.error(`🧨 Erro no worker: ${String(err)}`);
    });

    res.status(202).json({ message: 'Atualização de SLA iniciada em segundo plano.' });
  } catch (err) {
    logger.error(`Erro ao iniciar worker: ${String(err)}`);
    res.status(500).json({ error: 'Falha ao iniciar atualização SLA.' });
  }
}
