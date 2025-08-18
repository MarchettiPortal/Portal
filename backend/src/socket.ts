// src/socket.ts
import { Server as IOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { getRedisPub, getRedisSub } from './config/Redis/redis.client';
import { config } from './config/Global/global.config';

let io: IOServer | null = null;

export async function initSocket(server: any) {
  if (io) return io; // evita inicializar duas vezes no mesmo processo

  io = new IOServer(server, {
    cors: {
      origin: config.BASE_URL_PORTAL, // pode ser string ou array
      credentials: true,
    },
  });

  if (process.env.NODE_ENV === 'production') {
    // Usa os singletons do seu módulo Redis
    const pubClient = getRedisPub();
    const subClient = getRedisSub();

    // Tratamento de erros (não derruba o processo)
    pubClient.on('error', (err) => {
      console.error('[Redis Pub Error]', err);
    });
    subClient.on('error', (err) => {
      console.error('[Redis Sub Error]', err);
    });

    // Aguarda clientes ficarem prontos antes de plugar o adapter (evita race)
    await Promise.all([
      new Promise<void>((resolve) => {
        if ((pubClient as any).status === 'ready') return resolve();
        pubClient.once('ready', () => resolve());
      }),
      new Promise<void>((resolve) => {
        if ((subClient as any).status === 'ready') return resolve();
        subClient.once('ready', () => resolve());
      }),
    ]);

    io.adapter(createAdapter(pubClient, subClient));
  }

  return io;
}

export function getSocket(): IOServer {
  if (!io) throw new Error('Socket.io não inicializado!');
  return io;
}
