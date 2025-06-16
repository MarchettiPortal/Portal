import { Client } from 'basic-ftp';
import fs from 'fs';
import { getSocket } from '../../socket'; 

const FTP_CONFIG = {
  host:'SV-WPS-WEG',
  user: 'admin',
  password: 'weg',
  port:2221,
};

type ArquivoFtp = {
  nome: string;
  tamanho: number;
};
 

// 🔧 Função para listar os arquivos
export async function listarArquivoFtp(caminho: string): Promise<ArquivoFtp[]> {
  const client = new Client();
  try {
    await client.access(FTP_CONFIG);
    const arquivos = await client.list(caminho);
    const arquivosVisiveis = arquivos.filter(a => !a.name.startsWith('.'));
    const arquivosComTamanho: ArquivoFtp[] = [];

    for (const a of arquivosVisiveis) {
      let tamanho = 0;
      try {
        tamanho = await client.size(`${a.name}`);
      } catch (e) {
        console.log(`Erro ao buscar tamanho de ${a.name}:`, e);
      }

      arquivosComTamanho.push({
        nome: a.name,
        tamanho: tamanho,
      });
    }

    return arquivosComTamanho;
  } catch (error) {
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
    try {
      try {
      await client.rename(antigoNome, novoNome);
    } catch (err: any) {
      if (err.code === 553 && err.message.includes('No such file or directory')) {
        // Validação: verifica se o arquivo novo existe
        const listaArquivos = await client.list('/');
        const renomeado = listaArquivos.find(a => a.name === novoNome);
        if (renomeado) {
          console.warn(`[AVISO RENAME FTP] 553 retornado, mas ${novoNome} existe. Assumindo sucesso.`);
          return;
        } else {
          console.error('[ERRO RENAME FTP] 553 verdadeiro: arquivo não encontrado após tentativa de renomear.');
          throw err;
        }
      }
      throw err;
    }
      console.log(`Arquivo renomeado de ${antigoNome} para ${novoNome}`);
    } catch (err: any) {
      if (err.code === 553 && err.message.includes('No such file or directory')) {
        // Validação: verifica se o arquivo novo existe
        const listaArquivos = await client.list('/');
        const renomeado = listaArquivos.find(a => a.name === novoNome);
        if (renomeado) {
          console.warn(`[AVISO RENAME FTP] 553 retornado, mas ${novoNome} existe. Assumindo sucesso.`);
          return;
        } else {
          console.error('[ERRO RENAME FTP] 553 verdadeiro: arquivo não encontrado após tentativa de renomear.');
          throw err;
        }
      }
      throw err;
    }
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