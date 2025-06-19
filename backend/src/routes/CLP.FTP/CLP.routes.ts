import { Router } from 'express';
import { getClpStatus, setClpConfig } from '../../controllers/CLP/CLP.Controller'
import { listarClps, adicionarClp, removerClp, atualizarOpcaoCLP,  } from '../../controllers/CLP/CLP.Controller';
import { validate } from '../../middleware/validate'
import { setClpConfigSchema } from '../../validators/clp'

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
router.post('/add', adicionarClp) // Adicionar CLP's no banco de dados
router.delete('/del/:id', removerClp) // Remove CLP's no banco de dados
router.patch('/edit/:id', async (req, res) => { // Edita CLP's no banco de dados
  const id = parseInt(req.params.id)
  const { nome, ip, ativo, sistema_clp } = req.body
  if ([nome, ip, ativo, sistema_clp].some(v => v === undefined)) {
    res.status(400).json({ error: 'Campos obrigatórios: nome, ip, ativo, sistema_clp' });
    return;
  }
  try {
    await atualizarOpcaoCLP(id, { nome, ip, ativo, sistema_clp })
    res.status(200).json({ success: true, message: 'CLP atualizado com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar CLP:', error)
    res.status(500).json({ error: 'Erro interno ao atualizar CLP' })
  }
})


export default router;