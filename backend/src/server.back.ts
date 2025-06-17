import app from './app.js';
import https from 'https';
import http from 'http';
import { httpsConfig  } from './config/Global/https.config.js';
import dotenv from 'dotenv';
import { config } from './config/Global/global.config.js'
import { pool } from './config/Global/db.config.js';
import { iniciarAgendador, pararAgendador } from './services/Milvus/Milvus.csvSLA.Scheduler.service.js';
import { initSocket } from './socket.js'
import './workers/O365.UsersGroups.refresh.worker.js'; 


// ** Definições do Server **
dotenv.config() // Inicializa o DOTENV para busca de valores
const PORT_HTTP = config.PORT_HTTP; // Busca a porta definida no DOTENV do global.config.ts
const httpServer = http.createServer(app) // Insere na variável as funções do Express
initSocket(httpServer) // Inicializa Socket.IO sobre o server Express


// ** Inicialização do Server **
httpServer.listen(PORT_HTTP, () => {
  console.log(`Servidor HTTP e Socket.IO rodando em http://127.0.0.1:${PORT_HTTP}`) // Start no server em HTTP
})


// Start no server em HTTP
// https.createServer(httpsConfig, app).listen(config.PORT_HTTPS, () => {
//   console.log(`Servidor HTTPS rodando na porta ${config.PORT_HTTPS}`)
// })


// ** Funções que inicializam junto com o servidor **
iniciarAgendador() // Inicializa o agendador de validação de chamados para atualização do banco de dados


// ** Funções de desligamento do servidor **
process.on('SIGINT', shutdown); // Manipulador que detecta sinalização de encerramento e chama a função shutdown()
process.on('SIGTERM', shutdown); // Manipulador que detecta sinalização de encerramento e chama a função shutdown()

async function shutdown() { // Encerramento
  try {
    pararAgendador() // Para o agendador de validação de chamados para atualização do banco de dados
    await pool.end() // Finaliza a conexão com o banco de dados
  } catch (err) {
    console.error('Erro ao encerrar recursos:', err)
  } finally {
    process.exit()
  }
}
