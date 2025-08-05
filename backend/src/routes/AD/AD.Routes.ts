import { Router } from 'express';
import { listGroups, addUser, checkStatus } from '../../controllers/AD/AD.Controller'
import { validate } from '../../middleware/validate';
import { createUserSchema } from '../../validators/ad';

const router = Router();

/** Lista os grupos disponíveis no AD. */
router.get('/groups', listGroups);

/** Cria um novo usuário no AD. */
router.post('/users', validate(createUserSchema), addUser);

/** Verifica o status do serviço de AD. */
router.get('/status', checkStatus);

export default router;
