import { Router } from 'express';
import { listarClps, adicionarClp, removerClp, atualizarOpcaoCLP, getClpStatus, setClpConfig } from '../../controllers/CLP/CLP.Controller';
import { validate } from '../../middleware/validate'
import { setClpConfigSchema, createClpSchema, updateClpSchema } from '../../validators/clp'
import { idParamSchema } from '../../validators/common'
import { logger } from '../../utils/logger'

const router = Router();

// Chamadas ao serviço remoto
/**
 * Obtém o status atual do CLP.
 * @route GET /api/clp/status
 */
router.get('/status', getClpStatus);

/**
 * Define o IP do CLP e reinicia o WPS pelo serviço remoto.
 * @route POST /api/clp/set
 */
router.post('/set', validate(setClpConfigSchema), setClpConfig);

/** Lista CLPs cadastrados. */
router.get('/list', listarClps)
/** Adiciona CLP. */
router.post('/add', validate(createClpSchema), adicionarClp)
/** Remove CLPs cadastrados. */
router.delete('/del/:id', validate(idParamSchema, 'params'), removerClp)

/** Edita CLPs cadastrados. */
router.patch('/edit/:id', validate(idParamSchema, 'params'), validate(updateClpSchema), async (req, res) => { 
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