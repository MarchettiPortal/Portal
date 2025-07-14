import { sessionGuard } from '../Auth/auth.routes';
import { Router, Request, Response } from 'express';
import { listPermissoes, listPermissoesPorGrupos } from '../../repositories/o365.repository';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * GET /api/CMDB/permissoes
 * Retorna todas as permissões (rota, nome_visivel, grupo_pai) que o usuário pode ver.
 * 1) Lê req.user.groups para extrair nomesDosGrupos.
 * 2) Se incluir “TI - Infraestrutura”, devolve TUDO.
 * 3) Senão, devolve só as linhas de permissoes vinculadas em grupo_permissoes a esses grupos.
 */
router.get('/permissoes', sessionGuard, async (req: Request, res: Response) => {
  try {
    const user = req.user as { oid: string; name: string; email: string; grupos: Array<{ id: string; nome: string }> };
    const nomesDosGrupos = user.grupos.map((g) => g.nome);

    // 1) Se for Admin (TI - Infraestrutura),
    //    devolve todas as permissões
    if (nomesDosGrupos.includes('TI - Infraestrutura')) {
      const all = await listPermissoes();
      res.json(all);
      return
    }

    // 2) Senão, devolve só as permissões desse(s) grupo(s)
    const rows = await listPermissoesPorGrupos(nomesDosGrupos);
    res.json(rows);
    return
  } catch (err) {
    logger.error(`Erro em /api/routes/auth/permissoes: ${String(err)}`);
    res.status(500).send('Erro interno');
  }
});

export default router;
