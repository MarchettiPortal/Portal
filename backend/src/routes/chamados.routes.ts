import { Router } from 'express';
import { getRefresh} from "../controllers/Milvus/Milvus.csvSLA.controller.js";
import { getRefreshAuto } from "../controllers/Milvus/Milvus.API.AutoRefresh.controller.js"
import { getAgendadorStatus, setAgendadorStatus, iniciarAgendador, pararAgendador } from '../services/Milvus/Milvus.csvSLA.Scheduler.service.js'
import * as  chamadosController from '../controllers/Milvus/DB.Chamados.controller.js';

const router = Router();

// ******** Rotas de CRUD ********
// Rota para "Refresh" dos dados TOTAIS dos Tickets no Banco de Dados
router.get("/SLArefreshSemanal", getRefresh); 
// Rota para "Refresh" dos dados dos tickets em aberto no Banco de Dados
router.get("/SLArefreshAutomatico", getRefreshAuto); 
 
// Rotas para Refresh Automático
router.get('/status', async (req, res) => {
  const status = await getAgendadorStatus()
  res.json({ ativo: status })
})

router.post('/status', async (req, res) => {
  const { ativo } = req.body
  await setAgendadorStatus(ativo)

  if (ativo) {
    await iniciarAgendador()
  } else {
    pararAgendador()
  }

  res.json({ sucesso: true })
})



// Rota para Listar TODOS os Chamados
router.get('/chamados', chamadosController.listarChamados); // Listar todos os chamados
// Rota para criar um novo chamado
router.post('/chamados', chamadosController.criarChamado);
// Rota para atualizar um chamado existente
router.put('/chamados/:codigo', chamadosController.editarChamado);
// Rota para excluir um chamado/valor
router.delete('/chamados/:codigo', chamadosController.excluirChamado);


// ******** Rotas de listagem de chamados para Dashboard ********
router.get('/chamados/setor', chamadosController.getChamadosPorSetor); // chamados por setor
router.get('/dashboard/operador', chamadosController.getChamadosPorOperador); // chamados por operador
router.get('/dashboard/prioridade', chamadosController.getChamadosPorPrioridade); // chamados por prioridade
router.get('/dashboard/sla', chamadosController.getChamadosPorSLA); // chamados SLA
router.get('/dashboard/local', chamadosController.getChamadosPorLocal); // chamados por Local
router.get('/dashboard/reabertos', chamadosController.getChamadosReabertos); // chamados reabertos





export default router;