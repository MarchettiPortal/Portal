import { pool } from '../config/Global/db.config';
import { ClpOpcaoPayload } from '../types/clp';

export async function findActiveClps() {
  const { rows } = await pool.query('SELECT * FROM clps WHERE ativo = TRUE ORDER BY nome');
  return rows;
}

export async function insertClp(payload: ClpOpcaoPayload) {
  const { nome, ip, ativo, sistema_clp } = payload;
  await pool.query(
    'INSERT INTO clps (nome, ip, ativo, sistema_clp) VALUES ($1, $2, $3, $4)',
    [nome, ip, ativo, sistema_clp]
  );
}

export async function disableClp(id: number) {
  await pool.query('UPDATE clps SET ativo = FALSE WHERE id = $1', [id]);
}

export async function updateClp(id: number, payload: ClpOpcaoPayload) {
  const { nome, ip, ativo, sistema_clp = 'padrao' } = payload;
  await pool.query(
    'UPDATE clps SET nome = $1, ip = $2, ativo = $3, sistema_clp = $4 WHERE id = $5',
    [nome, ip, ativo, sistema_clp, id]
  );
}