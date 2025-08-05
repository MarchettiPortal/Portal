import { Router } from 'express';
import { getRefresh} from "../../controllers/Milvus/Milvus.csvSLA.controller";
import { getRefreshAuto } from "../../controllers/Milvus/Milvus.API.AutoRefresh.controller"
import { getAgendadorStatus, setAgendadorStatus, iniciarAgendador, pararAgendador } from '../../services/Milvus/csvSLA.Scheduler.service'
import * as  chamadosController from '../../controllers/Milvus/DB.Chamados.controller';
import { validate } from '../../middleware/validate';
import { createChamadoSchema, updateChamadoSchema, codigoParamSchema } from '../../validators/milvus';
import { getSocket } from '../../socket';

const router = Router();

/** Dispara a atualização semanal completa do SLA. */
router.get("/SLArefreshSemanal", getRefresh); 
/** Atualiza os tickets em aberto automaticamente. */
router.get("/SLArefreshAutomatico", getRefreshAuto); 
 
// Rotas para controle do agendador de refresh
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
  // Emitir para todos os clientes conectados sobre a alteração do status
  const io = getSocket()
  io.emit('agendador:status', { ativo })
  res.json({ sucesso: true })
})


/** Lista todos os chamados */
router.get('/chamados', chamadosController.listarChamados); 
/** Cria um novo chamado*/
router.post('/chamados', validate(createChamadoSchema), chamadosController.criarChamado);
/** Atualiza chamado existente */
router.put('/chamados/:codigo', validate(codigoParamSchema, 'params'), validate(updateChamadoSchema), chamadosController.editarChamado); 
/** Exclui um chamado/valor */
router.delete('/chamados/:codigo', validate(codigoParamSchema, 'params'), chamadosController.excluirChamado);
/** Lista chamados por setor */
router.get('/chamados/setor', chamadosController.getChamadosPorSetor);
/** Lista chamados por operador */
router.get('/chamados/operador', chamadosController.getChamadosPorOperador);
/** Lista chamados por operador */
router.get('/chamados/prioridade', chamadosController.getChamadosPorPrioridade); // chamados por prioridade
/** Lista chamados por SLA */
router.get('/chamados/sla', chamadosController.getChamadosPorSLA);
/** Lista chamados por local */
router.get('/chamados/local', chamadosController.getChamadosPorLocal);
/** Lista chamados reabertos */
router.get('/chamados/reabertos', chamadosController.getChamadosReabertos); // chamados reabertos
/** Lista contagem por tipo de atendimento em determinado ano */
router.get('/chamados/tipo-atendimento/:ano', chamadosController.getChamadosPorTipoAtendimento);
/*
* Eu fiz uma lógica: 
* router.get('/users/:campo', validate(campoParamSchema, 'params'), listCampoUsuarios); 
* Que LISTA todos os valores de uma Coluna de acordo com o Campo enviado pelo Frontend
* Implementar isso aqui, ou então tipo, uma rota retorna ao frontend todas as tabelas da coluna Chamados, e o frontend seleciona quais que quer, com filtros e tal
* Depois envia pra uma rota aqui no back que interpreta e retorna, sem precisar ter uma rota pra cada coisa
*/

export default router;