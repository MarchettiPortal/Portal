import { Request, Response } from 'express';
import axios from 'axios';
import { logger } from '../../utils/logger';
import { config } from '../../config/Global/global.config';
import ping from 'ping';
import net from 'net';


// Verifica se o Serviço remoto do WPS/WEG está ativo
export async function checkServiceHealth(req: Request, res: Response) {
  try {
    const { data } = await axios.get(`${config.BASE_URL_NGINX}/status`, {
      timeout: 2000,
    });

    if (typeof data !== 'object' || data === null) {
      res.status(500).json({ status: 'down', error: 'Resposta inválida do serviço remoto' });
      return;
    }

    res.json({ status: 'up', ...data });
  } catch (error) {
    logger.error('Serviço WPS/FTP/WEG Offline.', );
    res.status(500).json({ status: 'down' });
  }
}

// Ping no servidor  do WPS
export async function checkServerWPS(req: Request, res: Response) {
  const host = `${config.BASE_URL_SERVER_WPS}`; // IP do servidor WPS

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
    logger.error('Servidor WPS Offline')
    res.status(500).json({ status: 'down'});
  }
}


// Requisição na porta 2221 para ver se o WPS está ativo
export async function checkAppWps(req: Request, res: Response){
const WPS_SERVER_HOST = config.BASE_URL_SERVER_WPS
const WPS_SERVER_PORT = 2221;
const CONNECTION_TIMEOUT = 3000; // em ms


  const socket = new net.Socket();

  const onResult = (status: 'up' | 'down', error?: string) => {
    res.status(status === 'up' ? 200 : 500).json({ status, error });
  };

  socket.setTimeout(CONNECTION_TIMEOUT);

  socket.once('connect', () => {
    socket.destroy();
    onResult('up');
  });

  socket.once('timeout', () => {
    socket.destroy();
    onResult('down', 'Timeout na conexão');
  });

  socket.once('error', (err) => {
    socket.destroy();
    onResult('down', err.message);
  });

  socket.connect(WPS_SERVER_PORT, WPS_SERVER_HOST);
}


