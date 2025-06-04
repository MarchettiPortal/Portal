// backend/src/socket.ts
import { Server as IOServer } from 'socket.io';

let io: IOServer | null = null;

export function initSocket(server: any) {
  io = new IOServer(server, {
    cors: { origin: '*' }
  });
  return io;
}

export function getSocket(): IOServer {
  if (!io) throw new Error('Socket.io não inicializado!');
  return io;
}
