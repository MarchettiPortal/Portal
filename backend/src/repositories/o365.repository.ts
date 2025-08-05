import { pool } from '../config/Global/db.config';

/**
 * Retorna todos os usuários cadastrados.
 *
 * @returns Lista completa de usuários.
 */
export async function listUsuarios() {
  const result = await pool.query('SELECT * FROM ms365_users');
  return result.rows;
}

/**
 * Retorna todos os grupos do AD.
 *
 * @returns Array de grupos cadastrados.
 */
export async function listGrupos() {
  const result = await pool.query('SELECT * FROM ad_local_groups');
  return result.rows;
}

/**
 * Lista as relações entre usuários e grupos.
 *
 * @returns Relações usuário x grupo existentes.
 */
export async function listUsuariosGrupos() {
  const result = await pool.query('SELECT * FROM ad_local_user_group');
  return result.rows;
}

/**
 * Obtém todas as permissões cadastradas.
 *
 * @returns Permissões registradas no sistema.
 */
export async function listPermissoes() {
  const result = await pool.query('SELECT * FROM auth_permissions');
  return result.rows;
}

/**
 * Recupera as associações entre grupos e permissões.
 *
 * @returns Lista de vínculos entre grupos e permissões.
 */
export async function listGrupoPermissoes() {
  const result = await pool.query('SELECT * FROM auth_permissions_group');
  return result.rows;
}

/**
 * Lista permissões visíveis para determinados grupos.
 *
 * @param nomes Lista de nomes de grupos filtrados.
 * @returns Permissões correspondentes.
 */
export async function listPermissoesPorGrupos(nomes: string[]) {
  const { rows } = await pool.query(
    `SELECT DISTINCT p.rota, p.nome_visivel, p.grupo_pai
       FROM auth_permissions_group gp
       JOIN auth_permissions p ON p.id = gp.permissao_id
       JOIN ad_local_groups g ON g.id = gp.grupo_id
      WHERE g.nome = ANY($1::text[])
      ORDER BY p.grupo_pai, p.nome_visivel`,
    [nomes]
  );
  return rows;
}

export async function getGrupoIdsByNomes(nomes: string[]): Promise<string[]> {
  const { rows } = await pool.query(
    `SELECT id FROM ms365_groups WHERE nome = ANY($1::text[])`,
    [nomes]
  );
  return rows.map(r => r.id);
}

/**
 * Seleciona apenas o campo informado para todos os usuários.
 *
 * @param campo Nome da coluna desejada.
 * @returns Valores da coluna solicitada.
 */
export async function selectCampoUsuarios(campo: string) {
  const query = `SELECT id, ${campo} FROM ms365_users ORDER BY id`;
  const { rows } = await pool.query(query);
  return rows;
}

/**
 * Lista os nomes das colunas da tabela de usuários.
 *
 * @returns Array de nomes de coluna.
 */
export async function listarCamposUsuarios() {
  const result = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'ms365_users' ORDER BY ordinal_position;`
  );
  return result.rows.map(r => r.column_name);
}

/**
 * Insere uma nova permissão.
 *
 * @param rota Caminho da rota.
 * @param nomeVisivel Nome exibido no frontend.
 * @param grupoPai Grupo pai vinculado.
 * @returns Registro criado.
 */
export async function insertPermissao(rota: string, nomeVisivel: string, grupoPai: string) {
  const result = await pool.query(
    `INSERT INTO auth_permissions (id, rota, nome_visivel, grupo_pai)
     VALUES (gen_random_uuid()::text, $1, $2, $3)
     RETURNING *`,
    [rota, nomeVisivel, grupoPai]
  );
  return result.rows[0];
}

/**
 * Atualiza uma permissão existente.
 *
 * @param id Identificador da permissão.
 * @param rota Caminho da rota.
 * @param nomeVisivel Nome a ser exibido.
 * @param grupoPai Grupo pai vinculado.
 * @returns Registro atualizado.
 */
export async function updatePermissao(id: string, rota: string, nomeVisivel: string, grupoPai: string) {
  const result = await pool.query(
    `UPDATE auth_permissions
     SET rota = $1, nome_visivel = $2, grupo_pai = $3
     WHERE id = $4
     RETURNING *`,
    [rota, nomeVisivel, grupoPai, id]
  );
  return result.rows[0];
}

/**
 * Remove uma permissão pelo ID.
 *
 * @param id Identificador da permissão.
 */
export async function deletePermissao(id: string) {
  await pool.query('DELETE FROM auth_permissions WHERE id = $1', [id]);
}

/**
 * Cria vínculo entre grupo, permissão e usuário.
 *
 * @param grupoId ID do grupo no AD.
 * @param permissaoId ID da permissão cadastrada.
 * @param userId ID do usuário.
 * @returns Registro criado no banco.
 */
export async function insertGrupoPermissao(grupoId: string, permissaoId: string, userId: string) {
  const result = await pool.query(
    `INSERT INTO auth_permissions_group (grupo_id, permissao_id, user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [grupoId, permissaoId, userId]
  );
  return result.rows[0];
}

/**
 * Atualiza vínculo entre grupo, permissão e usuário.
 *
 * @param id Identificador do registro de vínculo.
 * @param grupoId ID do grupo no AD.
 * @param permissaoId ID da permissão.
 * @param userId ID do usuário.
 * @returns Registro atualizado.
 */
export async function updateGrupoPermissao(id: string, grupoId: string, permissaoId: string, userId: string) {
  const result = await pool.query(
    `UPDATE auth_permissions_group
     SET grupo_id = $1, permissao_id = $2, user_id = $3
     WHERE id = $4
     RETURNING *`,
    [grupoId, permissaoId, userId, id]
  );
  return result.rows[0];
}

/**
 * Remove o vínculo de grupo/permissão pelo ID.
 *
 * @param id Identificador do vínculo.
 */
export async function deleteGrupoPermissao(id: string) {
  await pool.query('DELETE FROM auth_permissions_group WHERE id = $1', [id]);
}

export async function listPermissoesPorGrupoIds(ids: string[]) {
  const { rows } = await pool.query(
    `SELECT DISTINCT p.rota, p.nome_visivel, p.grupo_pai
       FROM auth_permissions_group gp
       JOIN auth_permissions p ON p.id = gp.permissao_id
      WHERE gp.grupo_id = ANY($1::text[])
      ORDER BY p.grupo_pai, p.nome_visivel`,
    [ids]
  );
  return rows;
}