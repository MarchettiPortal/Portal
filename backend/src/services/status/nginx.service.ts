import { Request, Response } from 'express';
import net from 'net';
import { config } from '../../config/Global/global.config';


/**
 * Verifica se o serviço NGINX está aceitando conexões na porta especificada.
 *
 * @param _req Requisição Express.
 * @param res Resposta com o status do servidor.
 */
export async function checkNginx(req: Request, res: Response) {
  const host = config.BASE_URL_SERVER_NGINX // IP ou hostname do servidor do nginx
  const port = Number(process.env.NGINX_PORT || 8080);
  const timeout = 3000;

  const socket = new net.Socket();

  const onResult = (status: 'up' | 'down', error?: string) => {
    res.status(status === 'up' ? 200 : 500).json({ status, error });
  };

  socket.setTimeout(timeout);

  socket.once('connect', () => {
    socket.destroy();
    onResult('up');
  });

  socket.once('timeout', () => {
    socket.destroy();
    onResult('down', 'Timeout');
  });

  socket.once('error', (err) => {
    socket.destroy();
    onResult('down', err.message);
  });

  socket.connect(port, host);
}
