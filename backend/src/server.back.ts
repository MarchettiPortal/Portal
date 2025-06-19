import app from './app.js';
import https from 'https';
import http from 'http';
import { getHttpsConfig  } from './config/Global/https.config.js';
import dotenv from 'dotenv';
import { config } from './config/Global/global.config.js'
import { pool } from './config/Global/db.config.js';
import { iniciarAgendador, pararAgendador } from './services/Milvus/csvSLA.Scheduler.service.js';
import { initSocket } from './socket.js'
import './workers/O365.UsersGroups.refresh.worker.js'
import { logger } from './utils/logger';

/**
 * Definições do Servidor
 */
dotenv.config() // Inicializa o DOTENV para busca de valores
const IP_SERVER = config.BASE_URL_BACKEND; // Endereço do server
const PORT_HTTP = config.PORT_HTTP; // Busca a porta definida no DOTENV do global.config.ts
const httpServer = http.createServer(app) // Insere na variável as funções do Express
initSocket(httpServer) // Inicializa Socket.IO sobre o server Express


/**
 * Inicialização do Servidor
 */
httpServer.listen(PORT_HTTP, () => {
  logger.info(`Servidor HTTP e Socket.IO rodando em ${IP_SERVER}`);
});


// Start no server em HTTP
// https.createServer(httpsConfig, app).listen(config.PORT_HTTPS, () => {
//   logger.log(`Servidor HTTPS rodando na porta ${config.PORT_HTTPS}`)
// })

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
