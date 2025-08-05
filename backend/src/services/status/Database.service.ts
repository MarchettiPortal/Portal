import { Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { config } from '../../config/Global/global.config';
import ping from 'ping';
import pool from '../../config/Global/db.config';



/**
 * Realiza um ping no servidor SQL configurado.
 *
 * @param _req Requisição HTTP.
 * @param res Resposta indicando se o host está acessível.
 */
export async function checkServerSQL(req: Request, res: Response) {
  const host = `${config.BASE_URL_SERVER_DATABASE}`; // IP do servidor SQL

  try {
    const result = await ping.promise.probe(host, {
      timeout: 2,
    });

    if (result.alive) {
      res.json({ status: 'up', time: result.time + ' ms' });
    } else {
      res.status(500).json({ status: 'down' });
    }
  } catch (error) {
    logger.error('Servidor SQL Offline')
    res.status(500).json({ status: 'down'});
  }
}

/**
 * Verifica a conectividade com o PostgreSQL executando uma consulta simples.
 *
 * @param _req Requisição HTTP.
 * @param res Resposta com status do banco.
 */
export async function checkPostgreSQL(req: Request, res: Response) {
  try {
    const result = await pool.query('SELECT 1;');
    
    if (result && result.rows.length > 0) {
      res.status(200).json({ status: 'up' });
    } else {
      res.status(500).json({ status: 'down', error: 'Consulta inválida' });
    }
  } catch (error) {
    res.status(500).json({ status: 'down', error: (error as Error).message });
  }
}


