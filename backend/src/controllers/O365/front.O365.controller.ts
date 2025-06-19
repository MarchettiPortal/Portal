import { Request, Response } from 'express';
import { pool } from '../../config/Global/db.config';
import * as o365Repo from '../../repositories/o365.repository';

/**
 * Lista todos os usuários cadastrados no banco.
 */
export const listUsuarios = async (_req: Request, res: Response) => {
  const usuarios = await o365Repo.listUsuarios();
  res.json(usuarios);
};


// Lista todos os grupos cadastrados na tabela `ad_grupos`.
export const listGrupos = async (_req: Request, res: Response) => {
  const grupos = await o365Repo.listGrupos();
  res.json(grupos);
};

// Lista todas as associações entre usuários e grupos.
export const listUsuariosGrupos = async (_req: Request, res: Response) => {
  const dados = await o365Repo.listUsuariosGrupos();
  res.json(dados);
}

// Lista todas as permissões (rotas).
export const listPermissoes = async (_req: Request, res: Response) => {
  const permissoes = await o365Repo.listPermissoes();
  res.json(permissoes);
};
// Lista todas as associações entre grupo, permissão e usuário.
export const listGrupoPermissoes = async (_req: Request, res: Response) => {
  const dados = await o365Repo.listGrupoPermissoes();
  res.json(dados);
};

// Lista os dados da tabela Usuários de acordo com o Campo solicitado no Frontend
export async function listCampoUsuarios(req: Request, res: Response) {
  const { campo } = req.params;

  try {
    // 1. Obtém colunas da tabela "usuarios"
    const colunasValidas = await o365Repo.listarCamposUsuarios();

    if (!colunasValidas.includes(campo)) {
      res.status(400).json({ erro: `Campo '${campo}' não é válido.` });
      return;
    }

    // 2. Executa a query para retornar id + campo
    const rows = await o365Repo.selectCampoUsuarios(campo);


    res.status(200).json(rows);
    return;
  } catch (err) {
    console.error(`Erro ao listar campo ${campo}:`, err);
    res.status(500).json({ erro: 'Erro ao acessar o banco de dados.' });
    return;
  }
}

export async function listCamposUsuarios(req: Request, res: Response) {
  try {
    const colunas = await o365Repo.listarCamposUsuarios();
    res.status(200).json({ colunas });
    return;
  } catch (err) {
    console.error('Erro ao listar colunas da tabela usuarios:', err);
    res.status(500).json({ erro: 'Erro ao acessar o banco de dados.' });
    return;
  }
}

/**
 * Cria uma nova permissão (rota).
 */
export const createPermissao = async (req: Request, res: Response) => {
  const { rota, nome_visivel, grupo_pai } = req.body;
  const nova = await o365Repo.insertPermissao(rota, nome_visivel, grupo_pai);
  res.status(201).json(nova);
};

/**
 * Atualiza uma permissão existente.
 */
export const updatePermissao = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rota, nome_visivel, grupo_pai } = req.body;
  const updated = await o365Repo.updatePermissao(id, rota, nome_visivel, grupo_pai);
  res.json(updated);
};

/**
 * Remove uma permissão com base no ID.
 */
export const deletePermissao = async (req: Request, res: Response) => {
  const { id } = req.params;
  await o365Repo.deletePermissao(id);
  res.status(204).send();
};

/**
 * Cria uma nova associação grupo/permissão/usuário.
 */
export const addGrupoPermissao = async (req: Request, res: Response) => {
  const { grupo_id, permissao_id, user_id } = req.body;
  const inserido = await o365Repo.insertGrupoPermissao(grupo_id, permissao_id, user_id);
  res.status(201).json(inserido);
};

/**
 * Atualiza uma associação existente.
 */
export const updateGrupoPermissao = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { grupo_id, permissao_id, user_id } = req.body;
  const updated = await o365Repo.updateGrupoPermissao(id, grupo_id, permissao_id, user_id);
  res.json(updated);
};

/**
 * Remove uma associação com base no ID.
 */
export const deleteGrupoPermissao = async (req: Request, res: Response) => {
  const { id } = req.params;
  await o365Repo.deleteGrupoPermissao(id);
  res.status(204).send();
};