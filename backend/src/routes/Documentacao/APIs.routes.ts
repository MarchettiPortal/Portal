import { Router } from 'express';
import { listSections, listRoutesBySection, addSections, addRoutesBySection, editSections, deleteSections, editRouteBySection, deleteRouteBySection} from '../../controllers/Documentacoes/APIs.controller';

const router = Router();

// Rota até aqui é: backend/api/doc/

router.get('/listSections', listSections); // Lista as Seções cadastradas no Banco de Dados
router.post('/addSections', addSections); // Adiciona Seções no Banco de Dados
router.put('/editSections/:id', editSections); // Edita Seções no Banco de Dados
router.delete('/deleteSections/:id', deleteSections); // Remove Seções no Banco de Dados

router.get('/listRoutes/:sectionId', listRoutesBySection); // Lista API's x Seções no Banco de Dados
router.post('/addRoutes', addRoutesBySection); // Adiciona API's x Seções no Banco de Dados
router.put('/editRoute/:id', editRouteBySection); // Edita API's x Seções no Banco de Dados
router.delete('/deleteRoute/:id', deleteRouteBySection); // Remove API's x Seções no Banco de Dados


export default router;
