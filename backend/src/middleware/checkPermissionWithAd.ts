// src/middleware/checkPermissionWithAD.ts
import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/Global/db.config';

/**
 * 1. Se o usuário estiver no grupo 'TI - Infraestrutura' → libera tudo (Admin absoluto).
 * 2. Senão, pega todos os grupos AD aos quais o usuário pertence (pelo banco).
 * 3. Se entre esses grupos estiver 'Liderança' OU 'Supervisores', 
 *    aplicamos as permissões extras correspondentes (mapear isso em grupo_permissoes manualmene no banco, pelo front).
 * 4. Se não, basta checar se existe vínculo
 *    (usuario_id, permissao_id) via grupo_permissoes. 
 * 
 * req.user.id deve ser o ID do AzureAD (para acharmos o registro em 'usuarios').
 */

export async function checkPermissionWithAD(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as { oid: string; name: string; email: string; grupos: Array<{ id: string; nome: string }> };
    if (!user || !user.grupos) {
      return res.status(401).send('Usuário não autenticado');
    }

    // 1) Extrai só os nomes dos grupos do token
    const nomesDosGrupos = user.grupos.map((g) => g.nome);

    // 2) Se for membro de “TI - Infraestrutura”, libera tudo
    if (nomesDosGrupos.includes('TI - Infraestrutura')) {
      return next();
    }

    // 3) Monta a rota atual (req.baseUrl + req.path)
    const rotaAtual = (req.baseUrl || '') + req.path;

    // 4) Verifica no banco se existe vínculo entre algum grupo desse usuário e a rota
    const permRes = await pool.query(
      `
      SELECT 1
      FROM grupo_permissoes gp
      JOIN ad_grupos g ON g.id = gp.grupo_id
      JOIN permissoes p ON p.id = gp.permissao_id
      WHERE g.nome = ANY($1)
        AND p.rota = $2
      LIMIT 1
      `,
      [nomesDosGrupos, rotaAtual]
    );
    if (permRes.rowCount === 0) {
      return res.status(403).send('Acesso negado');
    }

    // 5) Se encontrou, libera a rota
    next();
  } catch (err) {
    console.error('Erro em checkPermissionWithAD:', err);
    res.status(500).send('Erro interno do servidor');
  }
}
