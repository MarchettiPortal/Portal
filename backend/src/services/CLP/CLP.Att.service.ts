import { Request, Response } from 'express';
import axios from 'axios';
import { logger } from '../../utils/logger';
import { setReiniciando } from '../../flags/wpsFTP';
import { getSocket } from '../../socket';
import { config } from '../../config/Global/global.config';

const TIMEOUT = 120_000;

// Busca qual CLP está selecionado
export async function getClpStatus(req: Request, res: Response) {
  try {
    const { data } = await axios.get(`${config.BASE_URL_NGINX}/clp/status`);
    res.json(data);
  } catch (error) {
    logger.error('Erro ao obter status do CLP:', error);
    res.status(500).json({ error: 'Erro ao obter status do CLP' });
  }
}

// Edita o CLP conforme informações vindas do Frontend
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
    logger.info(`[BACKEND][SET CLP] Enviando IP ${ip} para ${config.BASE_URL_NGINX}/clp/config`);

    const { data } = await axios.post(
      `${config.BASE_URL_NGINX}/clp/config`,
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




