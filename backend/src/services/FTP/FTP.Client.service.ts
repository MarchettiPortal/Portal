import { Client } from 'basic-ftp';
import { promises as fs } from 'fs';
import { getSocket } from '../../socket';
import ftpConfig from '../../config/FTP/dotenv.ftp.config';
import path from 'path';
import { logger } from '../../utils/logger';
import { ArquivoFtp } from '../../types/clp.ftp';


const FTP_CONFIG = {
  host: ftpConfig.host,
  user: ftpConfig.user,
  password: ftpConfig.password,
  port: ftpConfig.port,
  timeout: ftpConfig.timeout
};



// 🔧 Função para listar os arquivos
/**
 * Lista arquivos disponíveis em um diretório FTP.
 * 
 * @param caminho Caminho remoto a ser listado.
 * @returns Lista de arquivos com seus tamanhos.
 * @throws Propaga erros de conexão ou listagem.
 */
export async function listarArquivoFtp(caminhoPreferencial: string): Promise<ArquivoFtp[]> {
  const client = new Client();
  let caminhoUsado = caminhoPreferencial;

  try {
    await client.access(FTP_CONFIG);

    try {
      await client.cd(caminhoPreferencial); // tenta caminho padrão
    } catch (erro) {
      logger.warn(`Falha ao acessar ${caminhoPreferencial}, tentando raiz: ${String(erro)}`);
      caminhoUsado = '/';
      await client.cd(caminhoUsado);
    }
    const arquivos = await client.list();
    const arquivosVisiveis = arquivos.filter(a => a.type === 1 && !a.name.startsWith('.'));

    const arquivosComTamanho: ArquivoFtp[] = [];
    for (const a of arquivosVisiveis) {
      let tamanho = 0;
      try {
        tamanho = await client.size(a.name);
      } catch (e) {
        logger.warn(`Erro ao buscar tamanho de ${a.name}: ${String(e)}`);
      }
      arquivosComTamanho.push({ nome: a.name, tamanho });
    }

    return arquivosComTamanho;
  } catch (error) {
    throw error;
  } finally {
    client.close();
  }
}




// 🔧 Função para enviar o arquivo
/**
 * Envia um arquivo para o servidor FTP exibindo progresso via socket opcional.
 * @param localPath Caminho local do arquivo a ser enviado.
 * @param remotePath Nome do arquivo remoto de destino.
 * @param socketId Id da conexão Socket.IO para envio de progresso.
 * @returns Promessa resolvida quando o upload for finalizado.
 * @throws Erros de conexão ou upload.
 */
export async function enviarArquivoFtp(localPath: string, remotePath: string, socketId?: string) {
  const client = new Client();
  client.ftp.verbose = true;
  const ftpAny = client.ftp as any;
  const io = getSocket();

  try {
    await client.access({
      ...FTP_CONFIG,
      secure: false,
    } as any);

    // ⚠️ Garante timeout no socket de controle
    client.ftp.socket.setTimeout(300000);

    // ⚠️ Força timeout no socket de dados 
    const originalHandleUpload = ftpAny.handleUpload;
    ftpAny.handleUpload = async function (source: any, remotePath: any) {
      const result = await originalHandleUpload.call(this, source, remotePath);
      if (this.dataSocket) {
        this.dataSocket.setTimeout(300000); // ⏱️ Timeout de 5 minutos no socket de dados
      }
      return result;
    };

    const { size: tamanhoTotal } = await fs.stat(localPath);

    client.trackProgress(info => {
      const percent = Math.round((info.bytes / tamanhoTotal) * 100);
      if (socketId) io.to(socketId).emit('ftp-progress', Math.min(percent, 99));
    });

    const safeRemote = path.posix.basename(remotePath);
    await client.uploadFrom(localPath, safeRemote);

    if (socketId) {
      io.to(socketId).emit('ftp-progress', 100);
      io.to(socketId).emit('ftp-finished');
    }

  } catch (err) {
    logger.error(`[ERRO UPLOAD FTP] ${String(err)}`, { timestamp: new Date().toISOString() });
    throw err;
  } finally {
    console.log('chegou aqui')
    client.trackProgress(undefined);
    //client.close();
  }
}

// 🔧 Função para renomear arquivo
/**
 * Renomeia um arquivo no servidor FTP, validando possíveis falhas.
 * @param antigoNome Nome atual do arquivo.
 * @param novoNome Novo nome solicitado.
 * @returns Promessa resolvida após a operação.
 * @throws Erros de conexão ou renomeação.
 */
export async function renomearArquivoFtp(antigoNome: string, novoNome: string) {
  const client = new Client();
  try {
    await client.access(FTP_CONFIG);
    const from = path.posix.basename(antigoNome);
    const to = path.posix.basename(novoNome);
    try {

      try {
        await client.rename(from, to);
      }catch (err: any) {
        if (err.code === 553 && err.message.includes('No such file or directory')) {
          const listaArquivos = await client.list('/');
          const renomeado = listaArquivos.find(a => a.name === to);
          if (renomeado) {
            logger.warn(`[AVISO RENAME FTP] 553 retornado, mas ${to} existe. Assumindo sucesso.`);
            return;
          } else {
            logger.error('[ERRO RENAME FTP] 553 verdadeiro: arquivo não encontrado após tentativa de renomear.');
            throw err;
          }
        }
      throw err;
    }
      logger.info(`Arquivo renomeado de ${from} para ${to}`);
    } catch (err: any) {
      if (err.code === 553 && err.message.includes('No such file or directory')) {
        // Validação: verifica se o arquivo novo existe
        const listaArquivos = await client.list('/');
        const renomeado = listaArquivos.find(a => a.name === to);
        if (renomeado) {
          logger.warn(`[AVISO RENAME FTP] 553 retornado, mas ${to} existe. Assumindo sucesso.`);
          return;
        } else {
          logger.error('[ERRO RENAME FTP] 553 verdadeiro: arquivo não encontrado após tentativa de renomear.');
          throw err;
        }
      }
      throw err;
    }
  } catch (err) {
    logger.error(`[ERRO RENAME FTP] ${String(err)}`);
    throw err;
  } finally {
    client.close();
  }
}


// 🔧 Função para excluir arquivo
/**
 * Remove um arquivo do servidor FTP.
 * @param nomeArquivo Nome do arquivo a ser removido.
 * @returns Promessa resolvida quando o arquivo for excluído.
 * @throws Erros de conexão ou exclusão.
 */

export async function excluirArquivoFtp(nomeArquivo: string): Promise<void> {
  const client = new Client();
  try {
    await client.access(FTP_CONFIG);
    const safeName = path.posix.basename(nomeArquivo);
    await client.remove(safeName);
  } catch (err) {
    logger.error(`[ERRO DELETE FTP] ${String(err)}`);
    throw err;
  } finally {
    client.close();
  }
}


