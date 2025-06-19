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
import { validate } from '../../middleware/validate';
import { permissaoSchema, grupoPermissaoSchema, idParamSchema, campoParamSchema } from '../../validators/o365';
import { logger } from '../../utils/logger'

const router = Router();

// Rotas relacionadas ao Backend
router.get('/back/sync-users-groups', async (req, res) => {
  try {
    await syncAllTeamsGroupsAndMembers();
    res.json({ message: 'Sincronização concluída com sucesso.' });
  } catch (error: any) {
    logger.error('Erro ao sincronizar grupos do Teams:', error.message);
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
router.get('/users/:campo', validate(campoParamSchema, 'params'), listCampoUsuarios); // LISTA todos os valores de uma Coluna de acordo com o Campo enviado pelo Frontend
router.get('/camposusers', listCamposUsuarios); // LISTA todos os nomes de colunas da tabela USUÁRIOS - USADO PARA DEBUG RÁPIDO


// Rotas
router.post('/routesDB', validate(permissaoSchema), createPermissao); // ADICIONA uma ROTA
router.put('/routesDB/:id', validate(idParamSchema, 'params'), validate(permissaoSchema), updatePermissao); // EDITA uma ROTA
router.delete('/routesDB/:id', validate(idParamSchema, 'params'), deletePermissao); // REMOVE uma ROTA

// Associações grupo/permissao/usuario
router.post('/group-perms', validate(grupoPermissaoSchema), addGrupoPermissao); // ADICIONA permissão
router.put('/group-perms/:id', validate(idParamSchema, 'params'), validate(grupoPermissaoSchema), updateGrupoPermissao); // EDITA permissão
router.delete('/group-perms/:id', validate(idParamSchema, 'params'), deleteGrupoPermissao); // REMOVE permissão

export default router;
