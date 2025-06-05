import { sessionGuard } from '../auth/auth.routes';
import { pool } from '../../config/Global/db.config';
import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /api/CMDB/permissoes
 * Retorna todas as permissões (rota, nome_visivel, grupo_pai) que o usuário pode ver.
 * 1) Lê req.user.groups para extrair nomesDosGrupos.
 * 2) Se incluir “TI - Infraestrutura”, devolve TUDO.
 * 3) Senão, devolve só as linhas de permissoes vinculadas em grupo_permissoes a esses grupos.
 */
router.get('/', sessionGuard, async (req: Request, res: Response) => {
  try {
    const user = req.user as { oid: string; name: string; email: string; grupos: Array<{ id: string; nome: string }> };
    const nomesDosGrupos = user.grupos.map((g) => g.nome);

    // 1) Se for Admin (TI - Infraestrutura),
    //    devolve todas as permissões
    if (nomesDosGrupos.includes('TI - Infraestrutura')) {
      const all = await pool.query(
        'SELECT rota, nome_visivel, grupo_pai FROM permissoes ORDER BY grupo_pai, nome_visivel'
      );
      res.json(all.rows);
      return
    }

    // 2) Senão, devolve só as permissões desse(s) grupo(s)
    const rows = await pool.query(
      `
      SELECT DISTINCT p.rota, p.nome_visivel, p.grupo_pai
      FROM grupo_permissoes gp
      JOIN permissoes p ON p.id = gp.permissao_id
      JOIN ad_grupos g ON g.id = gp.grupo_id
      WHERE g.nome = ANY($1)
      ORDER BY p.grupo_pai, p.nome_visivel
      `,
      [nomesDosGrupos]
    );
    res.json(rows.rows);
    return
  } catch (err) {
    console.error('Erro em /api/CMDB/permissoes:', err);
    res.status(500).send('Erro interno');
  }
});

export default router;
