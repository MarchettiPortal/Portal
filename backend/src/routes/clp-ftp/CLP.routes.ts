import { Router } from 'express';
import { getClpStatus, setClpConfig } from '../../controllers/CLP/CLP.Controller'
import { listarClps, adicionarClp, removerClp, atualizarOpcaoCLP,  } from '../../controllers/CLP/CLP.Controller';
import { validate } from '../../middleware/validate'
import { setClpConfigSchema, createClpSchema, updateClpSchema } from '../../validators/clp'
import { idParamSchema } from '../../validators/common'
import { logger } from '../../utils/logger'

const router = Router();

// Chamadas ao serviço Remoto
/**
 * Obtém o status atual do CLP.
 * @route GET /api/clp/status
 */
router.get('/status', getClpStatus);

/**
 * Define o IP do CLP e reinicia o serviço remoto.
 * @route POST /api/clp/set
 */
router.post('/set', validate(setClpConfigSchema), setClpConfig);

// Chamadas ao Banco de Dados
router.get('/list', listarClps) // Lista os CLP's no banco de dados
router.post('/add', validate(createClpSchema), adicionarClp) // Adicionar CLP
router.delete('/del/:id', validate(idParamSchema, 'params'), removerClp) // Remove CLP's no banco de dados
router.patch('/edit/:id', validate(idParamSchema, 'params'), validate(updateClpSchema), async (req, res) => { // Edita CLP's no banco de dados
  const id = parseInt(req.params.id)
  const { nome, ip, ativo, sistema_clp } = req.body
  try {
    await atualizarOpcaoCLP(id, { nome, ip, ativo, sistema_clp })
    res.status(200).json({ success: true, message: 'CLP atualizado com sucesso' })
  } catch (error) {
    logger.error('Erro ao atualizar CLP:', error)
    res.status(500).json({ error: 'Erro interno ao atualizar CLP' })
  }
})


export default router;