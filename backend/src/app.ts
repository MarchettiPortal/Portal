import express from 'express';
import authRouter from './routes/Auth/auth.routes';
import milvusRouter from './routes/Milvus/chamados.routes';
import graphRouter from './routes/O365/O365.routes';
import clpRouter from './routes/CLP.FTP/CLP.routes'
import permRouter from './routes/Auth/permissoes.routes'
import ftpRouter from './routes/CLP.FTP/FTP.routes'
import { config } from './config/Global/global.config.js'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import adRouter from './routes/AD/AD.Routes'
//import officeRouter from './routes/office365.routes'

const app = express(); // Aplicando na variável APP todo o Framework do Express

// ** Middlewares **
app.use( // Middleware para permitir cookies cross-origin (CORS)
    cors({ 
        origin: config.BASE_URL_FRONTEND, // Endereço do Frontend
        credentials: true, // Permite envio de cookies com Credenciais
    })
)
app.use(express.json()); // Middleware para rotas JSON 
app.use(cookieParser()); // Middleware para ler cookies

// ** Rotas **
app.use('/auth', authRouter);// Rota de Autenticação e Sessão Ativa
app.use("/api/milvus",milvusRouter); // Rotas do Milvus e Chamados
app.use('/api/graph', graphRouter); // Rota da integração com Office365 
app.use('/api/clp', clpRouter); // Rotas CLP
app.use('/api/ftp', ftpRouter); // Rotas FTP
app.use('/api/perm', permRouter); // Rotas de Permissões dos Usuários x Páginas
app.use('/api/ad',adRouter); // Rotas da integração com AD

export default app;
