import { Router } from 'express';
import {
  listUsuarios,
  listGrupos,
  listUsuariosGrupos,
  listPermissoes,
  createPermissao,
  updatePermissao,
  deletePermissao,
  listGrupoPermissoes,
  addGrupoPermissao,
  updateGrupoPermissao,
  deleteGrupoPermissao,
  listCampoUsuarios,
  listCamposUsuarios
} from '../../controllers/O365/front.O365.controller';
import { syncAllTeamsGroupsAndMembers } from '../../services/O365/SyncGroup.service';

const router = Router();

// Rotas relacionadas ao Backend
router.get('/back/sync-users-groups', async (req, res) => {
  try {
    await syncAllTeamsGroupsAndMembers();
    res.json({ message: 'Sincronização concluída com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao sincronizar grupos do Teams:', error.message);
    res.status(500).json({ error: 'Erro interno ao sincronizar grupos.' });
  }
});

// Rotas relacionadas ao Frontend
// Listagens
router.get('/All-users', listUsuarios); // LISTA todos os USUÁRIOS no Banco de Dados
router.get('/All-groups', listGrupos); // LISTA todos os GRUPOS no Banco de Dados
router.get('/users-groups', listUsuariosGrupos); // LISTA todos os GRUPOS e MEMBROS no Banco de Dados
router.get('/routesDB', listPermissoes); // LISTA todas as ROTAS no Banco de Dados
router.get('/groups-perms', listGrupoPermissoes); // LISTA todas as ROTAS x GRUPOS e/ou USUÁRIOS no Banco de Dados
router.get('/users/:campo', listCampoUsuarios); // LISTA todos os valores de uma Coluna de acordo com o Campo enviado pelo Frontend
router.get('/camposusers', listCamposUsuarios); // LISTA todos os nomes de colunas da tabela USUÁRIOS - USADO PARA DEBUG RÁPIDO


// Rotas
router.post('/routesDB', createPermissao); // ADICIONA uma ROTA no banco de dados
router.put('/routesDB/:id', updatePermissao); // EDITA uma ROTA no banco de dados
router.delete('/routesDB/:id', deletePermissao); // REMOVE uma ROTA no banco de dados

// Associações grupo/permissao/usuario
router.post('/group-perms', addGrupoPermissao); // ADICIONA uma permissão de acesso de uma ROTA para UM GRUPO ou para um USUÁRIO
router.put('/group-perms/:id', updateGrupoPermissao); // EDITA uma permissão de acesso de uma ROTA para UM GRUPO ou para um USUÁRIO
router.delete('/group-perms/:id', deleteGrupoPermissao); // REMOVE uma permissão de acesso de uma ROTA para UM GRUPO ou para um USUÁRIO

export default router;
