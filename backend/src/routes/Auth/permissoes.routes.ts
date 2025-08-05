import { sessionGuard } from '../Auth/auth.routes';
import { Router, Request, Response } from 'express';
import { listPermissoes, listPermissoesPorGrupos, getGrupoIdsByNomes, listPermissoesPorGrupoIds } from '../../repositories/o365.repository';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * Retorna todas as permissões (rota, nome_visivel, grupo_pai) que o usuário pode ver.
 * 1) Lê req.user.groups para extrair nomesDosGrupos.
 * 2) Se incluir “TI - Infraestrutura”, devolve TUDO.
 * 3) Senão, devolve só as linhas de permissoes vinculadas em auth_permissions_group a esses grupos.
 */
router.get('/permissoes', sessionGuard, async (req: Request, res: Response) => {
  try {
    const user = req.user as { oid: string; name: string; email: string; grupos: Array<{ id: string; nome: string }> };
    const nomesDosGrupos = user.grupos.map((g) => g.nome);
    const grupoIds = await getGrupoIdsByNomes(nomesDosGrupos);

    // 1) Se for Admin (TI - Infraestrutura),
    //    devolve todas as permissões
    if (nomesDosGrupos.includes('TI - Infraestrutura')) {
      const all = await listPermissoes();
      res.json(all);
      return
    }

    // 2) Senão, devolve só as permissões desse(s) grupo(s)
    const permissoes = await listPermissoesPorGrupoIds(grupoIds);
    res.json(permissoes);
    return
  } catch (err) {
    logger.error(`Erro em /api/perm/permissoes: ${String(err)}`);
    res.status(500).send('Erro interno');
  }
});

export default router;
