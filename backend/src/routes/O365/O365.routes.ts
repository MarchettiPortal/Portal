import { Router } from 'express';
import backRouter from './back.O365.routes'
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
  deleteGrupoPermissao
} from '../../controllers/O365/front.O365.controller';

const router = Router();

// Rotas relacionadas ao Backend
router.get('/back', backRouter); // /api/graph/back/sync-teams-groups - Sincroniza todos os USUÁRIOS, GRUPOS e USUÁRIOS x GRUPOS do Banco de Dados com o O365 automaticamente

// Rotas relacionadas ao Frontend
// Listagens
router.get('/users', listUsuarios); // LISTA todos os USUÁRIOS no Banco de Dados
router.get('/groups', listGrupos); // LISTA todos os GRUPOS no Banco de Dados
router.get('/users-groups', listUsuariosGrupos); // LISTA todos os GRUPOS e MEMBROS no Banco de Dados
router.get('/routesDB', listPermissoes); // LISTA todas as ROTAS no Banco de Dados
router.get('/groups-perms', listGrupoPermissoes); // LISTA todas as ROTAS x GRUPOS e/ou USUÁRIOS no Banco de Dados

// Rotas
router.post('/routesDB', createPermissao); // ADICIONA uma ROTA no banco de dados
router.put('/routesDB/:id', updatePermissao); // EDITA uma ROTA no banco de dados
router.delete('/routesDB/:id', deletePermissao); // REMOVE uma ROTA no banco de dados

// Associações grupo/permissao/usuario
router.post('/group-perms', addGrupoPermissao); // ADICIONA uma permissão de acesso de uma ROTA para UM GRUPO ou para um USUÁRIO
router.put('/group-perms/:id', updateGrupoPermissao); // EDITA uma permissão de acesso de uma ROTA para UM GRUPO ou para um USUÁRIO
router.delete('/group-perms/:id', deleteGrupoPermissao); // REMOVE uma permissão de acesso de uma ROTA para UM GRUPO ou para um USUÁRIO

export default router;
