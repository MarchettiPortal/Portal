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
  const { nome, ip } = req.body
  if (!nome || !ip)  res.status(400).json({ error: 'Nome e IP obrigatórios' }) 

  try {
    await pool.query('INSERT INTO clps (nome, ip) VALUES ($1, $2)', [nome, ip])
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
  const { label, value, sistema_clp = 'padrao' } = payload

  const query = `
    UPDATE clp_opcoes
    SET label = $1, value = $2, sistema_clp = $3
    WHERE id = $4
  `

  const values = [label, value, sistema_clp, id]

  await pool.query(query, values)
}
