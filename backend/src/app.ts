import express from 'express';
import authRouter from './routes/Auth/auth.routes';
import milvusRouter from './routes/Milvus/chamados.routes';
import graphRouter from './routes/O365/O365.routes';
import clpRouter from './routes/clp-ftp/CLP.routes'
import permRouter from './routes/Auth/permissoes.routes'
import ftpRouter from './routes/clp-ftp/FTP.routes'
import statusRouter from './routes/status/status.routes'
import docRouter from './routes/Documentacao/APIs.routes'
import { config } from './config/Global/global.config.js'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import adRouter from './routes/AD/AD.Routes'
import { errorHandler } from './middleware/errorHandler'


const whitelist = [
  'https://portalti.molasmarchetti.com.br',
  'https://devportalti.molasmarchetti.com.br',
  'https://devportalti2.molasmarchetti.com.br'
];

/**
 * Instância principal do aplicativo Express contendo todas as rotas e
 * middlewares configurados para a API.
 */
const app = express(); 

// ** Middlewares **
app.use( // Middleware para permitir cookies cross-origin (CORS)
    cors({ 
        origin: function (origin, callback) {
            if (!origin || whitelist.includes(origin)) {
            callback(null, true);
            } else {
            callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true
    })
)
app.use(express.json()); // Middleware para rotas JSON 
app.use(cookieParser()); // Middleware para ler cookies
app.use(errorHandler); // Middleware global de tratamento de erros


// ** Rotas **
app.use('/auth', authRouter);// Rota de Autenticação e Sessão Ativa
app.use("/api/milvus", milvusRouter); // Rotas do Milvus e Chamados
app.use('/api/graph', graphRouter); // Rota da integração com Office365 
app.use('/api/clp', clpRouter); // Rotas CLP
app.use('/api/ftp', ftpRouter); // Rotas FTP
app.use('/api/perm', permRouter); // Rotas de Permissões dos Usuários x Páginas
app.use('/api/ad', adRouter); // Rotas da integração com AD
app.use('/api/status', statusRouter); // Rotas de status de serviços e servidores
app.use('/api/doc', docRouter); // Rotas de documentações


export default app;
