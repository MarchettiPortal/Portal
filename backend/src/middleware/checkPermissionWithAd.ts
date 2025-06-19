// src/middleware/checkPermissionWithAD.ts
import { Request, Response, NextFunction } from 'express';
import { usuarioTemPermissao } from '../repositories/permission.repository';
import { logger } from '../utils/logger';

/**
 * Middleware que verifica se o usuário possui acesso a uma rota.
 */
export async function checkPermissionWithAD(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user as { oid: string; name: string; email: string; grupos: Array<{ id: string; nome: string, groupTypes: string }> };
    if (!user || !user.grupos) {
      return res.status(401).send('Usuário não autenticado');
    }

    // Extrai todos os nomes dos grupos, inclusive segurança
    const todosGrupos = user.grupos.map((g) => g.nome);

    // Se está no grupo de admins do AD, libera tudo
    if (todosGrupos.includes('Equipe TI - Infraestrutura')) {
      return next(); // Admin absoluto
    }

    // Filtra só os grupos "Unified" (Teams) — são os setores válidos
    const gruposTeams = user.grupos
      .filter((g) => g.groupTypes?.includes('Unified'))
      .map((g) => g.nome);


    // 3) Monta a rota atual (req.baseUrl + req.path)
    const rotaAtual = (req.baseUrl || '') + req.path;

    // 4) Verifica no banco se existe vínculo entre algum grupo desse usuário e a rota
    const permitido = await usuarioTemPermissao(gruposTeams, rotaAtual);
    if (!permitido) {
      return res.status(403).send('Acesso negado');
    }

    // 5) Se encontrou, libera a rota
    next();
  } catch (err) {
    logger.error(`Erro em checkPermissionWithAD: ${String(err)}`);
    res.status(500).send('Erro interno do servidor');
  }
}