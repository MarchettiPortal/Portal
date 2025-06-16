import { Router } from 'express';
import { getClpStatus, setClpConfig } from '../../services/CLP/CLP.Att.service'
import { listarClps, adicionarClp, removerClp, atualizarOpcaoCLP,  } from '../../controllers/CLP/CLP.Controller';

const router = Router();

// Chamadas ao serviço Remoto
router.get('/status', getClpStatus); // Serviço Remoto: Retorna qual CLP está setado
router.post('/set', setClpConfig); // Serviço Remoto: Altera IP do CLP e reinicia app

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