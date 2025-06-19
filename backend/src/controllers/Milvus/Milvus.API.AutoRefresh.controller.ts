import { Request, Response } from 'express';
import path from 'path';
import { Worker } from 'worker_threads';


export async function getRefreshAuto(req: Request, res: Response) {
  try {

    const workerPath = path.resolve(__dirname, '../../workers/Milvus.SLA.Refresh.worker.js');
    const worker = new Worker(workerPath);
    
    worker.on('message', (msg) => {
      if (msg.status === 'success') {
        console.log('✅ Worker finalizou com sucesso.');
      } else {
        console.error('❌ Erro no worker:', msg.error);
      }
    });

    worker.on('error', (err) => {
      console.error('🧨 Erro no worker:', err);
    });

    res.status(202).json({ message: 'Atualização de SLA iniciada em segundo plano.' });
  } catch (err) {
    console.error('Erro ao iniciar worker:', err);
    res.status(500).json({ error: 'Falha ao iniciar atualização SLA.' });
  }
}
