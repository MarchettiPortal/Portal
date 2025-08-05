import { Router } from 'express';
import { checkServiceHealth, checkServerWPS, checkAppWps } from '../../services/status/remoteWPS.service';
import { checkServerSQL, checkPostgreSQL } from '../../services/status/Database.service';
import { checkNginx } from '../../services/status/nginx.service';
import restartRouter from './refresh.routes'
const router = Router();

/** Verifica o serviço remoto responsável pelo WPS. */
router.get('/remotewps', checkServiceHealth);
/** Testa conectividade com o servidor WPS. */
router.get('/serverwps', checkServerWPS);
/** Verifica se o aplicativo WPS está ativo. */
router.get('/appwps', checkAppWps);
/** Checa disponibilidade do servidor SQL. */
router.get('/serversql', checkServerSQL);
/** Checa disponibilidade do PostgreSQL. */
router.get('/postgresql', checkPostgreSQL);
/** Verifica a saúde do NGINX. */
router.get('/nginx', checkNginx);
/** Rotas para reinício de serviços. */
router.get('/refresh', restartRouter)

export default router;