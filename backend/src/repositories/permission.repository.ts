import { pool } from '../config/Global/db.config';

/**
 * Verifica se algum dos grupos possui permissão para a rota.
 * @param grupos Lista de nomes de grupos do usuário.
 * @param rota Rota a ser verificada.
 * @returns Verdadeiro se a permissão existir.
 */
export async function usuarioTemPermissao(grupos: string[], rota: string): Promise<boolean> {
  const { rowCount } = await pool.query(
    `SELECT 1
       FROM auth_permissions_group gp
       JOIN ad_local_groups g ON g.id = gp.grupo_id
       JOIN auth_permissions p ON p.id = gp.permissao_id
      WHERE g.nome = ANY($1)
        AND p.rota = $2
      LIMIT 1`,
    [grupos, rota]
  );
  return rowCount > 0;
}
