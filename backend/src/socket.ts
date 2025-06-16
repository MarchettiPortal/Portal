import { Server as IOServer } from 'socket.io'; // Importa a classe Server do pacote 'socket.io' e renomeia como IOServer para evitar confusão com outros servidores.

let io: IOServer | null = null; // Variável global que irá armazenar a instância do socket.io. Inicialmente está como null e será definida ao iniciar o servidor WebSocket.

/**
 * Função para inicializar o servidor Socket.io.
 * @param server - Usa o servidor existente do Express.
 * @returns A instância do servidor Socket.io.
 * A instância é armazenada na variável `io` para poder ser reutilizada em outros pontos do sistema.
 */
export function initSocket(server: any) {
  io = new IOServer(server, {
    cors: { origin: '*' } // Permite conexões de qualquer origem (para desenvolvimento, mas depois alterar para os endereços em produção).
  });
  return io;
}

/**
 * Função para recuperar a instância atual do servidor Socket.io.
 * @returns A instância de Socket.io previamente inicializada.
 * @throws Um erro caso o servidor Socket.io ainda não tenha sido inicializado.
 * Essa função é útil para acessar o Socket.io fora do escopo onde foi inicializado, como em controllers ou services que precisam emitir eventos para os clientes.
 */
export function getSocket(): IOServer {
  if (!io) throw new Error('Socket.io não inicializado!');
  return io;
}
