import { pool } from '../config/Global/db.config';
import { ClpOpcaoPayload } from '../types/clp.ftp';

/**
 * Busca todos os CLP's ativos pelo nome
 */
export async function findActiveClps() {
  const { rows } = await pool.query('SELECT * FROM plc_devices WHERE ativo = TRUE ORDER BY nome');
  return rows;
}

/**
 * Insere um novo CLP no banco
 *
 * @param payload Dados do novo CLP.
 */
export async function insertClp(payload: ClpOpcaoPayload) {
  const { nome, ip, ativo, sistema_clp } = payload;
  await pool.query(
    'INSERT INTO plc_devices (nome, ip, ativo, sistema_clp) VALUES ($1, $2, $3, $4)',
    [nome, ip, ativo, sistema_clp]
  );
}

/**
 * Marca um CLP como Inativo.
 *
 * @param id Identificador do CLP.
 */
export async function disableClp(id: number) {
  await pool.query('UPDATE plc_devices SET ativo = FALSE WHERE id = $1', [id]);
}

/**
 * Atualiza um CLP existente.
 *
 * @param id Identificador do CLP.
 * @param payload Novos dados para o CLP.
 */
export async function updateClp(id: number, payload: ClpOpcaoPayload) {
  const { nome, ip, ativo, sistema_clp = 'padrao' } = payload;
  await pool.query(
    'UPDATE plc_devices SET nome = $1, ip = $2, ativo = $3, sistema_clp = $4 WHERE id = $5',
    [nome, ip, ativo, sistema_clp, id]
  );
}