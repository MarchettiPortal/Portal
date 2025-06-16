import { Request, Response } from 'express'
import pool from '../../config/Global/db.config'
import { ClpOpcaoPayload } from '../../types/clp'

// Listar CLP
export const listarClps = async (_req: Request, res: Response) => {
  const { rows } = await pool.query('SELECT * FROM clps WHERE ativo = TRUE ORDER BY nome')
  res.json(rows)
}

// Adicionar CLP
export const adicionarClp = async (req: Request, res: Response) => {
  const { nome, ip, ativo, sistema_clp } = req.body
  if (!nome || !ip || !sistema_clp)  res.status(400).json({ error: 'Nome, IP e Sistema obrigatórios' }) 

  try {
    await pool.query('INSERT INTO clps (nome, ip, ativo, sistema_clp) VALUES ($1, $2, $3, $4)', [nome, ip, ativo, sistema_clp])
    res.status(201).json({ success: true })
  } catch (e) {
    res.status(500).json({ error: 'Erro ao adicionar CLP' })
  }
}

// Remover CLP
export const removerClp = async (req: Request, res: Response) => {
  const { id } = req.params
  await pool.query('UPDATE clps SET ativo = FALSE WHERE id = $1', [id])
  res.json({ success: true })
}

// Editar valores de CLP
export async function atualizarOpcaoCLP(id: number, payload: ClpOpcaoPayload) {
  const { nome, ip, ativo, sistema_clp = 'padrao' } = payload

  await pool.query('UPDATE clps SET nome = $1, ip = $2, ativo = $3, sistema_clp = $4 WHERE id = $5', [nome, ip, ativo, sistema_clp, id])

}
