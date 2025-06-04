import app from './app.js';
import https from 'https';
import http from 'http';
import { httpsConfig  } from './config/Global/https.config.js';
import dotenv from 'dotenv';
import { config } from './config/Global/global.config.js'
import { pool } from './config/Global/db.config.js';
import { iniciarAgendador, pararAgendador } from './services/Milvus/Milvus.csvSLA.Scheduler.service.js';
import { initSocket } from './socket.js'

dotenv.config()

const PORT_HTTP = config.PORT_HTTP;

// Cria httpServer com Express
const httpServer = http.createServer(app)
// Inicializa Socket.IO sobre o server
initSocket(httpServer)

// Servidor HTTP para todas as rotas normais
// Start no HTTP
httpServer.listen(PORT_HTTP, () => {
  console.log(`Servidor HTTP e Socket.IO rodando em http://127.0.0.1:${PORT_HTTP}`)
})

// Se quiser HTTPS também, descomente:
// https.createServer(httpsConfig, app).listen(config.PORT_HTTPS, () => {
//   console.log(`Servidor HTTPS rodando na porta ${config.PORT_HTTPS}`)
// })


iniciarAgendador()
  //.then(() => console.log('Agendador iniciado automaticamente no boot.'))
  //.catch((err) => console.error('Erro ao iniciar agendador no boot:', err));



// Graceful shutdown
async function shutdown() {
  //console.log('\nEncerrando servidor...')
  try {
    pararAgendador()
    //console.log('⏹️ Agendador parado.')

    await pool.end()
    //console.log('✅ Conexão com banco encerrada.')
  } catch (err) {
    console.error('Erro ao encerrar recursos:', err)
  } finally {
    process.exit()
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);