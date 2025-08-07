import { Client } from 'basic-ftp';
import { promises as fs } from 'fs';
import { getSocket } from '../../socket';
import ftpConfig from '../../config/FTP/dotenv.ftp.config';
import path from 'path';
import { logger } from '../../utils/logger';
import { ArquivoFtp } from '../../types/clp.ftp';
import { exec } from 'child_process';

const host = ftpConfig.host;
const user = ftpConfig.user;
const password = ftpConfig.password;
const port = ftpConfig.port;

const FTP_CONFIG = {
  host,
  user,
  password,
  port,
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
export async function enviarArquivoFtp(localPath: string, remotePath: string, socketId?: string): Promise<void> {
  const fullRemote = `ftp://${user}:${password}@${host}:${port}`;

  const io = getSocket();
  const tempLogPath = `/tmp/lftp_${Date.now()}.log`;

  const command = [
    `lftp -e "`,
    `set net:timeout 300;`, // ⏱️ timeout de socket
    `set net:max-retries 2;`, // 🔁 tenta 2 vezes se falhar
    `set ftp:passive-mode true;`,
    `put "${localPath}" -o "${remotePath}";`,
    `bye" `,
    fullRemote,
    `> ${tempLogPath} 2>&1`, // log de erro e saída
  ].join(' ');

  logger.info(`[LFTP] Executando: ${command}`);

  return new Promise((resolve, reject) => {
    const start = Date.now();

    exec(command, async (error, stdout, stderr) => {
      const duration = Date.now() - start;

      if (socketId) io.to(socketId).emit('ftp-progress', 100);
      if (socketId) io.to(socketId).emit('ftp-finished');

      const log = await fs.readFile(tempLogPath, 'utf8').catch(() => '');
      await fs.unlink(tempLogPath).catch(() => {});

      if (error) {
        logger.error(`[LFTP ERRO] Tempo: ${duration}ms`);
        logger.error(`[LFTP LOG]:\n${log}`);
        return reject(new Error(`Erro ao enviar via LFTP: ${error.message}`));
      }

      logger.info(`[LFTP SUCESSO] Tempo: ${duration}ms`);
      logger.info(`[LFTP LOG]:\n${log}`);
      resolve();
    });
  });
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


