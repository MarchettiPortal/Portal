import express from 'express';
import authRouter from './routes/Auth/auth.routes';
import milvusRouter from './routes/Milvus/chamados.routes';
import graphRouter from './routes/O365/O365.routes';
import clpRouter from './routes/CLP.FTP/clp.WPS.routes'
import permRouter from './routes/Auth/permissoes.routes'
import { config } from './config/Global/global.config.js'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import adRouter from './routes/AD/AD.Routes'
//import officeRouter from './routes/office365.routes'

const app = express();

// Middleware para permitir cookies cross-origin
app.use(
    cors({
        origin: config.BASE_URL_FRONTEND, // frontend
        credentials: true, // permite envio de cookies
    })
)


// ** Middlewares **
app.use(express.json()); // Middleware para rotas JSON 
app.use(cookieParser()); // Middleware para ler cookies

// Rota de Autenticação e Sessão Ativa
app.use('/auth', authRouter);
// Rotas do Milvus e Chamados
app.use("/api/milvus",milvusRouter);
// Rota da integração com Office365
app.use('/api/graph', graphRouter);
// Rotas CLP e FTP 
app.use('/api/clp', clpRouter);
// Rotas de Permissões dos Usuários x Páginas
app.use('/api/perm', permRouter);
// Rotas da integração com AD
app.use('/api/ad',adRouter);

export default app;
