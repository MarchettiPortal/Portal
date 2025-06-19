import { Request, Response } from 'express';
import axios from 'axios';
import { logger } from '../../utils/logger';
import { setReiniciando } from '../../flags/wpsFTP';
import { getSocket } from '../../socket';
import { config } from '../../config/Global/global.config';

const TIMEOUT = 120_000;

/**
 * Recupera o status atual do CLP configurado.
 */
export async function fetchClpStatus() {
  const { data } = await axios.get(`${config.BASE_URL_NGINX}/clp/status`);
  return data;
}

export async function updateClpConfig(ip: string, userID: string) {
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
    return data;
  } catch (error: any) {
    logger.error(`[BACKEND][SET CLP] Erro ao configurar CLP com IP ${ip}:`, error.message || error);
    throw error;
  } finally {
    setReiniciando(false, null);
  }
}

///////////////////////////




