import { Client } from 'basic-ftp';
import fs from 'fs';
import { getSocket } from '../../socket'; 

const FTP_CONFIG = {
  host:'SV-WPS-WEG',
  user: 'admin',
  password: 'weg',
  port:2221,
};

// 🔧 Função para excluir os arquivos
export async function listarArquivoFtp(caminho: string) {
  const client = new Client();
  try {
    await client.access(FTP_CONFIG);
    const arquivos = await client.list(caminho);

    const arquivosVisiveis = arquivos.filter(a => !a.name.startsWith('.'));

    // Alteração aqui: retorna uma lista vazia se não houver arquivos, ao invés de lançar erro.
    return arquivosVisiveis.map(a => ({
      nome: a.name,
      tamanho: a.size,
    }));
  } catch (error) {
    // Caso ocorra um erro real na conexão ou listagem, propaga o erro para o front lidar.
    throw error;
  } finally {
    client.close();
  }
}

// 🔧 Função para enviar o arquivo
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

// 🔧 Função para renomear arquivo
export async function renomearArquivoFtp(antigoNome: string, novoNome: string) {
  const client = new Client();
  try {
    await client.access(FTP_CONFIG);
    await client.rename(antigoNome, novoNome);
  } catch (err) {
    console.error('[ERRO RENAME FTP]', err);
    throw err;
  } finally {
    client.close();
  }
}

// 🔧 Função para excluir arquivo
export async function excluirArquivoFtp(nomeArquivo: string) {
  const client = new Client();
  try {
    await client.access(FTP_CONFIG);
    await client.remove(nomeArquivo);
  } catch (err) {
    console.error('[ERRO DELETE FTP]', err);
    throw err;
  } finally {
    client.close();
  }
}