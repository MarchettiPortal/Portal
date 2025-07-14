import { Router } from 'express';
import { listGroups, addUser, checkStatus } from '../../controllers/AD/AD.Controller'
import { validate } from '../../middleware/validate';
import { createUserSchema } from '../../validators/ad';

const router = Router();

// Rota para listar grupos
router.get('/groups', listGroups);

// Rota para criar usuário
router.post('/users', validate(createUserSchema), addUser);

// Rota para verificar status
router.get('/status', checkStatus);

export default router;
