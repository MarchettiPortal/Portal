import { Router } from 'express';
import {
  listSections,
  listRoutesBySection,
  addSections,
  addRoutesBySection,
  editSections,
  deleteSections,
  editRouteBySection,
  deleteRouteBySection,
} from '../../controllers/Documentacoes/APIs.controller';
import { validate } from '../../middleware/validate';
import {
  createSectionSchema,
  editSectionSchema,
  createRouteSchema,
  editRouteSchema,
  idParamSchema as docIdParamSchema,
} from '../../validators/doc';

const router = Router();

// Rota até aqui é: backend/api/doc/

router.get('/listSections', listSections); // Lista as Seções cadastradas no Banco de Dados␊
router.post('/addSections', validate(createSectionSchema), addSections); // Adiciona Seções no Banco de Dados
router.put('/editSections/:id', validate(docIdParamSchema, 'params'), validate(editSectionSchema), editSections); // Edita Seções no Banco de Dados
router.delete('/deleteSections/:id', validate(docIdParamSchema, 'params'), deleteSections); // Remove Seções no Banco de Dados

router.get('/listRoutes/:sectionId', validate(docIdParamSchema, 'params'), listRoutesBySection); // Lista API's x Seções no Banco de Dados
router.post('/addRoutes', validate(createRouteSchema), addRoutesBySection); // Adiciona API's x Seções no Banco de Dados
router.put('/editRoute/:id', validate(docIdParamSchema, 'params'), validate(editRouteSchema), editRouteBySection); // Edita API's x Seções no Banco de Dados
router.delete('/deleteRoute/:id', validate(docIdParamSchema, 'params'), deleteRouteBySection); // Remove API's x Seções no Banco de Dados


export default router;
