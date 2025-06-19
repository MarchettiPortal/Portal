import { pool } from '../config/Global/db.config';

/**
 * Retorna todos os usuários cadastrados.
 */
export async function listUsuarios() {
  const result = await pool.query('SELECT * FROM usuarios');
  return result.rows;
}

/**
 * Retorna todos os grupos do AD.
 */
export async function listGrupos() {
  const result = await pool.query('SELECT * FROM ad_grupos');
  return result.rows;
}

/**
 * Lista as relações entre usuários e grupos.
 */
export async function listUsuariosGrupos() {
  const result = await pool.query('SELECT * FROM usuario_ad_grupo');
  return result.rows;
}

/**
 * Obtém todas as permissões cadastradas.
 */
export async function listPermissoes() {
  const result = await pool.query('SELECT * FROM permissoes');
  return result.rows;
}

/**
 * Recupera as associações entre grupos e permissões.
 */
export async function listGrupoPermissoes() {
  const result = await pool.query('SELECT * FROM grupo_permissoes');
  return result.rows;
}

/**
 * Seleciona apenas o campo informado para todos os usuários.
 */
export async function selectCampoUsuarios(campo: string) {
  const query = `SELECT id, ${campo} FROM usuarios ORDER BY id`;
  const { rows } = await pool.query(query);
  return rows;
}

/**
 * Lista os nomes das colunas da tabela de usuários.
 */
export async function listarCamposUsuarios() {
  const result = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'usuarios' ORDER BY ordinal_position;`
  );
  return result.rows.map(r => r.column_name);
}

/**
 * Insere uma nova permissão.
 */
export async function insertPermissao(rota: string, nomeVisivel: string, grupoPai: string) {
  const result = await pool.query(
    `INSERT INTO permissoes (id, rota, nome_visivel, grupo_pai)
     VALUES (gen_random_uuid()::text, $1, $2, $3)
     RETURNING *`,
    [rota, nomeVisivel, grupoPai]
  );
  return result.rows[0];
}

/**
 * Atualiza uma permissão existente.
 */
export async function updatePermissao(id: string, rota: string, nomeVisivel: string, grupoPai: string) {
  const result = await pool.query(
    `UPDATE permissoes
     SET rota = $1, nome_visivel = $2, grupo_pai = $3
     WHERE id = $4
     RETURNING *`,
    [rota, nomeVisivel, grupoPai, id]
  );
  return result.rows[0];
}

/**
 * Remove uma permissão pelo ID.
 */
export async function deletePermissao(id: string) {
  await pool.query('DELETE FROM permissoes WHERE id = $1', [id]);
}

/**
 * Cria vínculo entre grupo, permissão e usuário.
 */
export async function insertGrupoPermissao(grupoId: string, permissaoId: string, userId: string) {
  const result = await pool.query(
    `INSERT INTO grupo_permissoes (grupo_id, permissao_id, user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [grupoId, permissaoId, userId]
  );
  return result.rows[0];
}

/**
 * Atualiza vínculo entre grupo, permissão e usuário.
 */
export async function updateGrupoPermissao(id: string, grupoId: string, permissaoId: string, userId: string) {
  const result = await pool.query(
    `UPDATE grupo_permissoes
     SET grupo_id = $1, permissao_id = $2, user_id = $3
     WHERE id = $4
     RETURNING *`,
    [grupoId, permissaoId, userId, id]
  );
  return result.rows[0];
}

/**
 * Remove o vínculo de grupo/permissão pelo ID.
 */
export async function deleteGrupoPermissao(id: string) {
  await pool.query('DELETE FROM grupo_permissoes WHERE id = $1', [id]);
}