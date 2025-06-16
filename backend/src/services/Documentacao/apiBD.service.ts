import pool from "../../config/Global/db.config";

// ** Sections **
// Lista todas as Sections cadastradas no banco
export const getAllSections = async () => {
  const { rows } = await pool.query('SELECT * FROM doc_api_sections ORDER BY display_order');
  return rows;
};

// Adiciona Sections ao banco de dados
export const createSection = async (title: string, displayOrder: number) => {
  const { rows } = await pool.query(
    'INSERT INTO doc_api_sections (title, display_order, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *',
    [title, displayOrder]
  );
  return rows[0];
};

// Edita Sections ao banco de dados
export const updateSection = async (id: number, title: string, displayOrder: number) => {
  const { rows } = await pool.query(
    `UPDATE doc_api_sections 
     SET title = $1, display_order = $2, updated_at = NOW() 
     WHERE id = $3 RETURNING *`,
    [title, displayOrder, id]
  );
  return rows[0];
};

// Remove Sections ao banco de dados
export const removeSection = async (id: number) => {
  await pool.query('DELETE FROM doc_api_sections WHERE id = $1', [id]);
};


// ** Routes x Sections **

// Lista todas as Routes x Sections cadastradas no banco
export const getRoutesBySection = async (sectionId: number) => {
  const { rows } = await pool.query(
    'SELECT * FROM doc_api_routes WHERE section_id = $1 ORDER BY display_order',
    [sectionId]
  );
  return rows;
};

// Adiciona Routes x Sections no banco
export const createRoute = async (
  sectionId: number,
  method: string,
  url: string,
  description: string,
  displayOrder: number
) => {
  const { rows } = await pool.query(
    `INSERT INTO doc_api_routes 
    (section_id, method, url, description, display_order, created_at, updated_at) 
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
    RETURNING *`,
    [sectionId, method, url, description, displayOrder]
  );
  return rows[0];
};

// Edita Routes x Sections no banco
export const updateRoute = async (
  id: number,
  sectionId: number,
  method: string,
  url: string,
  description: string,
  displayOrder: number
) => {
  const { rows } = await pool.query(
    `UPDATE doc_api_routes 
     SET section_id = $1, method = $2, url = $3, description = $4, 
         display_order = $5, updated_at = NOW()
     WHERE id = $6 RETURNING *`,
    [sectionId, method, url, description, displayOrder, id]
  );
  return rows[0];
};

// Remove Routes x Sections no banco
export const removeRoute = async (id: number) => {
  await pool.query('DELETE FROM doc_api_routes WHERE id = $1', [id]);
};
