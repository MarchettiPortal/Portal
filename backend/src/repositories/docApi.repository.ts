import { pool } from '../config/Global/db.config';

/**
 * Lista todas as seções de API cadastradas.
 */
export async function findAllSections() {
  const { rows } = await pool.query('SELECT * FROM doc_api_sections ORDER BY display_order');
  return rows;
}

/**
 * Insere uma nova seção de API.
 */
export async function insertSection(title: string, displayOrder: number) {
  const { rows } = await pool.query(
    'INSERT INTO doc_api_sections (title, display_order, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *',
    [title, displayOrder]
  );
  return rows[0];
}

/**
 * Atualiza uma seção existente.
 */
export async function updateSection(id: number, title: string, displayOrder: number) {
  const { rows } = await pool.query(
    `UPDATE doc_api_sections
     SET title = $1, display_order = $2, updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [title, displayOrder, id]
  );
  return rows[0];
}

/**
 * Remove uma seção por ID.
 */
export async function removeSection(id: number) {
  await pool.query('DELETE FROM doc_api_sections WHERE id = $1', [id]);
}

/**
 * Lista rotas vinculadas a uma seção.
 */
export async function findRoutesBySection(sectionId: number) {
  const { rows } = await pool.query(
    'SELECT * FROM doc_api_routes WHERE section_id = $1 ORDER BY display_order',
    [sectionId]
  );
  return rows;
}

/**
 * Insere nova rota para uma seção.
 */
export async function insertRoute(
  sectionId: number,
  method: string,
  url: string,
  description: string,
  displayOrder: number
) {
  const { rows } = await pool.query(
    `INSERT INTO doc_api_routes
    (section_id, method, url, description, display_order, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING *`,
    [sectionId, method, url, description, displayOrder]
  );
  return rows[0];
}

/**
 * Atualiza rota existente.
 */
export async function updateRoute(
  id: number,
  sectionId: number,
  method: string,
  url: string,
  description: string,
  displayOrder: number
) {
  const { rows } = await pool.query(
    `UPDATE doc_api_routes
     SET section_id = $1, method = $2, url = $3, description = $4,
         display_order = $5, updated_at = NOW()
     WHERE id = $6 RETURNING *`,
    [sectionId, method, url, description, displayOrder, id]
  );
  return rows[0];
}

/**
 * Remove rota por ID.
 */
export async function removeRoute(id: number) {
  await pool.query('DELETE FROM doc_api_routes WHERE id = $1', [id]);
}