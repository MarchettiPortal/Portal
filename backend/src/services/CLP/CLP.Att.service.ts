import { Request, Response } from 'express';
import axios from 'axios';
import { logger } from '../../utils/logger';
import { setReiniciando } from '../../flags/wpsFTP';
import { getSocket } from '../../socket';

const SERVICE_REMOTE_BASE = 'http://192.168.0.5:8080';
const TIMEOUT = 120_000;

export async function getClpStatus(req: Request, res: Response) {
  try {
    const { data } = await axios.get(`${SERVICE_REMOTE_BASE}/clp/status`);
    res.json(data);
  } catch (error) {
    logger.error('Erro ao obter status do CLP:', error);
    res.status(500).json({ error: 'Erro ao obter status do CLP' });
  }
}

export async function setClpConfig(req: Request, res: Response) {
  const { ip, userID } = req.body;
  logger.warn(userID)

  if (!ip || typeof ip !== 'string') {
    logger.warn('IP não informado ou inválido no body da requisição');
    res.status(400).json({ error: 'IP inválido ou não informado' });
    return;
  }

  if (!userID) {
    logger.warn('Requisição sem usuário autenticado');
     res.status(401).json({ error: 'Usuário não autenticado' });
    return;
  }

  setReiniciando(true, userID);

  try {
    logger.info(`[BACKEND][SET CLP] Enviando IP ${ip} para ${SERVICE_REMOTE_BASE}/clp/config`);

    const { data } = await axios.post(
      `${SERVICE_REMOTE_BASE}/clp/config`,
      { ip },
      {
        timeout: TIMEOUT,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    getSocket().emit('clp-trocado', { clp: data.clp })
    
    logger.info(`[BACKEND][SET CLP] Sucesso ao configurar: ${JSON.stringify(data)}`);
    res.json(data);
  } catch (error: any) {
    logger.error(`[BACKEND][SET CLP] Erro ao configurar CLP com IP ${ip}:`, error.message || error);

    res.status(500).json({ error: 'Erro ao configurar CLP' });
  } finally {
    setReiniciando(false, null);
  }
}

///////////////////////////

export async function checkServiceHealth(req: Request, res: Response) {
  try {
    const { data } = await axios.get(`${SERVICE_REMOTE_BASE}/status`);

    if (typeof data !== 'object' || data === null) {
      res.status(500).json({ status: 'down', error: 'Resposta inválida do serviço remoto' });
      return;
    }

    res.json({ status: 'up', ...data });
  } catch (error) {
    logger.error('Erro ao verificar health do serviço remoto:', error);
    res.status(500).json({ status: 'down' });
  }
}



