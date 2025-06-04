import { pool } from '../../config/Global/db.config';

export async function salvarLogFtpUpload({ usuario, nomeArquivo, descricao, tamanho, clp }: {
  usuario: string;
  nomeArquivo: string;
  descricao: string;
  tamanho: number;
  clp: string;
}) {
  const query = `
    INSERT INTO ftp_upload_logs (usuario, nome_arquivo, descricao, data_envio, tamanho, clp_selecionado)
    VALUES ($1, $2, $3, NOW(), $4, $5)
  `;
  
  const values = [usuario, nomeArquivo, descricao, tamanho, clp];

  try {
    await pool.query(query, values);
  } catch (err) {
    console.error('[DB][FTP_LOG] Erro ao salvar log de upload:', err);
    throw err;
  }
}

export async function listarLogsFtp() {
  const result = await pool.query(`SELECT * FROM ftp_upload_logs ORDER BY data_envio DESC`);
  return result.rows;
}