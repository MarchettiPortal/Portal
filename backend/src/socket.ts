import { Server as IOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { config } from './config/Global/global.config';

let io: IOServer | null = null;

export async function initSocket(server: any) {
  io = new IOServer(server, {
    cors: {
      origin: config.BASE_URL_PORTAL,
    },
  });

  // Somente usa Redis Adapter em produção
  if (process.env.NODE_ENV === 'production') {
    const pubClient = new Redis({
      host: '127.0.0.1',
      port: 6379,
      maxRetriesPerRequest: null, // evita crash
    });

    const subClient = pubClient.duplicate();

    // Trata erros para não quebrar app
    pubClient.on('error', (err) => {
      console.error('[Redis Pub Error]', err);
    });

    subClient.on('error', (err) => {
      console.error('[Redis Sub Error]', err);
    });

    io.adapter(createAdapter(pubClient, subClient));
  }

  return io;
}

export function getSocket(): IOServer {
  if (!io) throw new Error('Socket.io não inicializado!');
  return io;
}
