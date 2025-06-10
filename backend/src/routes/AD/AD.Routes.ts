import { Router } from 'express';
import { listGroups, addUser, checkStatus } from '../../controllers/AD/AD.Controller'

const router = Router();

// Rota para listar grupos
router.get('/groups', listGroups);

// Rota para criar usuário
router.post('/users', addUser);

// Rota para verificar status
router.get('/status', checkStatus);

export default router;
