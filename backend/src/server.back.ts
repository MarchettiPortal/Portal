import app from './app';
import http from 'http';
import dotenv from 'dotenv';
import { config } from './config/Global/global.config'
import { pool } from './config/Global/db.config';
import { iniciarAgendador, pararAgendador } from './services/Milvus/csvSLA.Scheduler.service';
import { initSocket } from './socket'
import './workers/O365.UsersGroups.scheduler.worker'
import { logger } from './utils/logger';

/**
 * Definições do Servidor
 */
dotenv.config() // Inicializa o DOTENV para busca de valores
const PORT_HTTP = config.PORT_HTTP; // Busca a porta definida no DOTENV do global.config.ts
const httpServer = http.createServer(app) // Insere na variável as funções do Express
initSocket(httpServer) // Inicializa Socket.IO sobre o server Express


/**
 * Inicialização do Servidor
 */
httpServer.listen(PORT_HTTP, '0.0.0.0', () => {
  logger.info(`Servidor HTTP e Socket.IO rodando em 0.0.0.0 ${PORT_HTTP}`);
});


/**
 * Funções que inicializam junto com o servidor
 */
iniciarAgendador(); // Inicializa o agendador de validação de chamados para atualização do banco de dados


/**
 * Encerra de forma graciosa o servidor liberando recursos utilizados.
 * Interrompe o agendador de tarefas e fecha a pool de conexões do banco.
 */
process.on('SIGINT', shutdown); // Manipulador que detecta sinalização de encerramento e chama a função shutdown()
process.on('SIGTERM', shutdown); // Manipulador que detecta sinalização de encerramento e chama a função shutdown()
async function shutdown() { // Encerramento
  try {
    pararAgendador() // Para o agendador de validação de chamados para atualização do banco de dados
    await pool.end() // Finaliza a conexão com o banco de dados
  } catch (err) {
    logger.error('Erro ao encerrar recursos:', err)
  } finally {
    process.exit()
  }
}
