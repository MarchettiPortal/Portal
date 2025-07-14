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

/**
 * Sincroniza usuários e grupos do Teams com o banco de dados.
 */
router.get('/back/sync-users-groups', async (req, res) => {
  try {
    await syncAllTeamsGroupsAndMembers();
    res.json({ message: 'Sincronização concluída com sucesso.' });
  } catch (error: any) {
    logger.error('Erro ao sincronizar grupos do Teams:', error.message);
    res.status(500).json({ error: 'Erro interno ao sincronizar grupos.' });
  }
});

/** Lista todos os usuários. */
router.get('/All-users', listUsuarios); 
/** Lista todos os grupos. */
router.get('/All-groups', listGrupos);
/** Lista todos os grupos e membros. */
router.get('/users-groups', listUsuariosGrupos);
/** Lista todas as rotas. */
router.get('/routesDB', listPermissoes);
/** Lista todas as Rotas x Grupos/Usuários. */
router.get('/groups-perms', listGrupoPermissoes);
/** Lista todos os valores de uma coluna solicitada pelo frontend. */
router.get('/users/:campo', validate(campoParamSchema, 'params'), listCampoUsuarios);
/** Lista todos os nomes de colunas da tabela Usuários. */
router.get('/camposusers', listCamposUsuarios);


/** Cadastra uma nova rota de permissão. */
router.post('/routesDB', validate(permissaoSchema), createPermissao);
/** Atualiza os dados de uma rota de permissão. */
router.put('/routesDB/:id', validate(idParamSchema, 'params'), validate(permissaoSchema), updatePermissao);
/** Exclui uma rota do banco de dados. */
router.delete('/routesDB/:id', validate(idParamSchema, 'params'), deletePermissao);


/** Adiciona uma permissão ao grupo . */
router.post('/group-perms', validate(grupoPermissaoSchema), addGrupoPermissao); 
/** Edita uma permissão do grupo . */
router.put('/group-perms/:id', validate(idParamSchema, 'params'), validate(grupoPermissaoSchema), updateGrupoPermissao);
/** Remove uma permissão do grupo . */
router.delete('/group-perms/:id', validate(idParamSchema, 'params'), deleteGrupoPermissao);

export default router;
