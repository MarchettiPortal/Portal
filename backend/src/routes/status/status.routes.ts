import { Router } from 'express';
import { checkServiceHealth, checkServerWPS, checkAppWps } from '../../services/status/remoteWPS.service';
import { checkServerSQL, checkPostgreSQL } from '../../services/status/Database.service';
import { checkNginx } from '../../services/status/nginx.service';
import restartRouter from './refresh.routes'
const router = Router();

// ** Rotas de Status **
router.get('/remotewps', checkServiceHealth); // Status do Serviço remoto que trata de CLP e FTP WEG
router.get('/serverwps', checkServerWPS); // Status do Servidor onde está o WPS e o serviço remoto de CLP e FTP WEG
router.get('/appwps', checkAppWps); // Status do APP WPS da WEG
router.get('/serversql', checkServerSQL); // Status do Servidor SQL
router.get('/postgresql', checkPostgreSQL); // Status do Banco de Dados (Se está ativo)
router.get('/nginx', checkNginx); // Status do NGINX
router.get('/refresh', restartRouter) // Rotas de Refresh

export default router;