import express from 'express';
import authRouter from './routes/auth/auth.routes';
import milvusRouter from './routes/chamados.routes';
import graphRouter from './routes/O365/O365.routes';
import clpRouter from './routes/clp.routes'
import { config } from './config/Global/global.config.js'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import permissoesRoute from './routes/auth/permissoes.routes'
import { checkPermissionWithAD } from './middleware/checkPermissionWithAd';

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
// Rota da API Chamados
app.use("/api/milvus",milvusRouter);
// Rota da API Office365
app.use('/api/graph', graphRouter);
// Rotas CLP e FTP
app.use('/api/clp', clpRouter)
// Rotas de permissão para menu dinâmico
app.use('/api/permissoes', permissoesRoute)

// exemplo: app.get('rota', sessionGuard, checkPermissionWithAD, router)

export default app;
