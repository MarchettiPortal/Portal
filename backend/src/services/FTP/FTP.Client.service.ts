import { Client } from 'basic-ftp';
import fs from 'fs';
import { getSocket } from '../../socket'; 

const FTP_CONFIG = {
  host:'SV-WPS-WEG',
  user: 'admin',
  password: 'weg',
  port:2221,
};


export async function listarArquivoFtp(caminho: string) {
  const client = new Client();
  try {
    await client.access(FTP_CONFIG);
    const arquivos = await client.list(caminho);

    const arquivo = arquivos.find(a => !a.name.startsWith('.'));
    if (!arquivo) throw new Error('Nenhum arquivo encontrado.');

    return {
      nome: arquivo.name,
      tamanho: arquivo.size,
    };
  } finally {
    client.close();
  }
}

export async function enviarArquivoFtp(localPath: string, remotePath: string, socketId?: string) {
  const client = new Client();
  client.ftp.verbose = true; // debug opcional
  const io = getSocket();

  try {
    await client.access({
      ...FTP_CONFIG,
      secure: false,
    });
  client.ftp.socket.setTimeout(120000); // 120 segundos

    const tamanhoTotal = fs.statSync(localPath).size;

    client.trackProgress(info => {
      const percent = Math.round((info.bytes / tamanhoTotal) * 100);
      if (socketId) io.to(socketId).emit('ftp-progress', Math.min(percent, 99)); // <= segura o 100%
    });

    await client.uploadFrom(localPath, remotePath);

    // Envia 100% apenas após finalizar o upload
    if (socketId) io.to(socketId).emit('ftp-progress', 100);
    if (socketId) io.to(socketId).emit('ftp-finished'); // opcional: evento explícito de fim

  } catch (err) {
    console.error('[ERRO UPLOAD FTP]', err);
    throw err;
  } finally {
    client.trackProgress(undefined);
    client.close();
  }
}

