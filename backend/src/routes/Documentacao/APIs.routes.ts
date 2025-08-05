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

/** Lista as seções cadastradas. */
router.get('/listSections', listSections);
/** Cria uma nova seção. */
router.post('/addSections', validate(createSectionSchema), addSections);
/** Edita dados de uma seção existente. */
router.put('/editSections/:id', validate(docIdParamSchema, 'params'), validate(editSectionSchema), editSections);
/** Remove uma seção pelo ID. */
router.delete('/deleteSections/:id', validate(docIdParamSchema, 'params'), deleteSections);
/** Lista rotas vinculadas a uma seção. */
router.get('/listRoutes/:sectionId', validate(docIdParamSchema, 'params'), listRoutesBySection);
/** Adiciona nova rota à seção informada. */
router.post('/addRoutes', validate(createRouteSchema), addRoutesBySection);
/** Atualiza informações de uma rota existente. */
router.put('/editRoute/:id', validate(docIdParamSchema, 'params'), validate(editRouteSchema), editRouteBySection);
/** Remove uma rota cadastrada. */
router.delete('/deleteRoute/:id', validate(docIdParamSchema, 'params'), deleteRouteBySection);


export default router;
