import { Request, Response } from 'express';
import { pool } from '../../config/Global/db.config';

// Lista todos os usuários cadastrados na tabela `usuarios`.
export const listUsuarios = async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM usuarios');
  res.json(result.rows);
};

// Lista todos os grupos cadastrados na tabela `ad_grupos`.
export const listGrupos = async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM ad_grupos');
  res.json(result.rows);
};

// Lista todas as associações entre usuários e grupos.
export const listUsuariosGrupos = async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM usuario_ad_grupo');
  res.json(result.rows);
};

// Lista todas as permissões (rotas).
export const listPermissoes = async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM permissoes');
  res.json(result.rows);
};

// Lista todas as associações entre grupo, permissão e usuário.
export const listGrupoPermissoes = async (_req: Request, res: Response) => {
  const result = await pool.query('SELECT * FROM grupo_permissoes');
  res.json(result.rows);
};

// Lista os dados da tabela Usuários de acordo com o Campo solicitado no Frontend
export async function listCampoUsuarios(req: Request, res: Response) {
  const { campo } = req.params;

  try {
    // 1. Obtém colunas da tabela "usuarios"
    const colunasRes = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'usuarios'
    `);

    const colunasValidas = colunasRes.rows.map((r) => r.column_name);

    if (!colunasValidas.includes(campo)) {
      res.status(400).json({ erro: `Campo '${campo}' não é válido.` });
      return;
    }

    // 2. Executa a query para retornar id + campo
    const query = `SELECT id, ${campo} FROM usuarios ORDER BY id`;
    const { rows } = await pool.query(query);

    res.status(200).json(rows);
    return;
  } catch (err) {
    console.error(`Erro ao listar campo ${campo}:`, err);
    res.status(500).json({ erro: 'Erro ao acessar o banco de dados.' });
    return;
  }
}


// Listar as colunas da tabela Usuários para DEBUG rápido
export async function listCamposUsuarios(req: Request, res: Response) {
  try {
    const result = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'usuarios'
      ORDER BY ordinal_position;
    `);

    const colunas = result.rows.map(r => r.column_name);
    res.status(200).json({ colunas });
    return;
  } catch (err) {
    console.error('Erro ao listar colunas da tabela usuarios:', err);
    res.status(500).json({ erro: 'Erro ao acessar o banco de dados.' });
    return;
  }
}

// Cria uma nova permissão (rota).
export const createPermissao = async (req: Request, res: Response) => {
  const { rota, nome_visivel, grupo_pai } = req.body;
  const result = await pool.query(
    `INSERT INTO permissoes (id, rota, nome_visivel, grupo_pai)
     VALUES (gen_random_uuid()::text, $1, $2, $3)
     RETURNING *`,
    [rota, nome_visivel, grupo_pai]
  );
  res.status(201).json(result.rows[0]);
};

// Atualiza uma permissão existente.
export const updatePermissao = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rota, nome_visivel, grupo_pai } = req.body;
  const result = await pool.query(
    `UPDATE permissoes
     SET rota = $1, nome_visivel = $2, grupo_pai = $3
     WHERE id = $4
     RETURNING *`,
    [rota, nome_visivel, grupo_pai, id]
  );
  res.json(result.rows[0]);
};

// Remove uma permissão com base no ID.
export const deletePermissao = async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM permissoes WHERE id = $1', [id]);
  res.status(204).send();
};

// Cria uma nova associação grupo/permissão/usuário.
export const addGrupoPermissao = async (req: Request, res: Response) => {
  const { grupo_id, permissao_id, user_id } = req.body;
  const result = await pool.query(
    `INSERT INTO grupo_permissoes (grupo_id, permissao_id, user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [grupo_id, permissao_id, user_id]
  );
  res.status(201).json(result.rows[0]);
};

// Atualiza uma associação existente.
export const updateGrupoPermissao = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { grupo_id, permissao_id, user_id } = req.body;
  const result = await pool.query(
    `UPDATE grupo_permissoes
     SET grupo_id = $1, permissao_id = $2, user_id = $3
     WHERE id = $4
     RETURNING *`,
    [grupo_id, permissao_id, user_id, id]
  );
  res.json(result.rows[0]);
};

// Remove uma associação com base no ID.
export const deleteGrupoPermissao = async (req: Request, res: Response) => {
  const { id } = req.params;
  await pool.query('DELETE FROM grupo_permissoes WHERE id = $1', [id]);
  res.status(204).send();
};
