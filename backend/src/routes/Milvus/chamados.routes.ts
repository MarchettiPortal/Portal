import { Router } from 'express';
import { getRefresh} from "../../controllers/Milvus/Milvus.csvSLA.controller.js";
import { getRefreshAuto } from "../../controllers/Milvus/Milvus.API.AutoRefresh.controller.js"
import { getAgendadorStatus, setAgendadorStatus, iniciarAgendador, pararAgendador } from '../../services/Milvus/csvSLA.Scheduler.service.js'
import * as  chamadosController from '../../controllers/Milvus/DB.Chamados.controller.js';
import { validate } from '../../middleware/validate';
import { createChamadoSchema, updateChamadoSchema, codigoParamSchema } from '../../validators/milvus.js';

const router = Router();

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



router.get('/chamados', chamadosController.listarChamados); // Rota para Listar TODOS os Chamados
router.post('/chamados', validate(createChamadoSchema), chamadosController.criarChamado); // Rota para criar um novo chamado
router.put('/chamados/:codigo', validate(codigoParamSchema, 'params'), validate(updateChamadoSchema), chamadosController.editarChamado); // Rota para atualizar um chamado existente
router.delete('/chamados/:codigo', validate(codigoParamSchema, 'params'), chamadosController.excluirChamado); // Rota para excluir um chamado/valor

router.get('/chamados/setor', chamadosController.getChamadosPorSetor); // chamados por setor
router.get('/chamados/operador', chamadosController.getChamadosPorOperador); // chamados por operador
router.get('/chamados/prioridade', chamadosController.getChamadosPorPrioridade); // chamados por prioridade
router.get('/chamados/sla', chamadosController.getChamadosPorSLA); // chamados SLA
router.get('/chamados/local', chamadosController.getChamadosPorLocal); // chamados por Local
router.get('/chamados/reabertos', chamadosController.getChamadosReabertos); // chamados reabertos

/*
* Eu fiz uma lógica: 
* router.get('/users/:campo', validate(campoParamSchema, 'params'), listCampoUsuarios); 
* Que LISTA todos os valores de uma Coluna de acordo com o Campo enviado pelo Frontend
* Implementar isso aqui, ou então tipo, uma rota retorna ao frontend todas as tabelas da coluna Chamados, e o frontend seleciona quais que quer, com filtros e tal
* Depois envia pra uma rota aqui no back que interpreta e retorna, sem precisar ter uma rota pra cada coisa
*/



export default router;