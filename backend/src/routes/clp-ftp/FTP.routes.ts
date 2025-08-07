import { Router } from 'express';
import { getSocket } from '../../socket';
import {
  listarArquivoFtp,
  renomearArquivoFtp,
  excluirArquivoFtp
} from '../../services/FTP/FTP.Client.service';
import { enviarArquivoFtpUniversal } from '../../services/FTP/FTP.EnviarArquivo.service';
import {
  salvarLogFtpUpload,
  listarLogsFtp
} from '../../services/FTP/FTP.LOG.service';
import multer from 'multer';
import { promises as fs } from 'fs';
import {
  isReiniciando,
  usuarioReiniciando,
  isEnviandoArquivo,
  usuarioEnviando,
  setEnviandoArquivo
} from '../../flags/wpsFTP';
import path from 'path';
import { validate } from '../../middleware/validate';
import { renameFileSchema, fileParamSchema } from '../../validators/ftp';
import { logger } from '../../utils/logger';

const upload = multer({
  dest: path.resolve(__dirname, '..', '..', 'uploads'),
});

const router = Router();

/**
 * Proxy de upload para ambientes de desenvolvimento.
 *
 * Recebe o arquivo localmente e o envia ao servidor de produção via LFTP.
 */
router.post('/upload-proxy', upload.single('arquivo'), async (req, res) => {
  const { remotePath, socketId } = req.body;
  const file = (req as any).file;

  if (!file) {
    res.status(400).json({ error: 'Arquivo ausente' });
    return;
  }

  try {
    await enviarArquivoFtpUniversal(file.path, remotePath, socketId);
    await fs.unlink(file.path);
    res.json({ sucesso: true });
  } catch (error: any) {
    logger.error('[ERRO UPLOAD PROXY]', error);
    res.status(500).json({ error: 'Erro interno no proxy', detalhes: error.message });
  }
});

// *** FTP ***
/**
 * Upload de arquivos para o servidor FTP.
 *
 * Utiliza Multer para receber o arquivo e envia feedback de progresso via
 * Socket.IO. Garante que o nome do arquivo seja seguro para shell e normalize
 * a extensão `.csv`. Renomeia o arquivo local antes do envio para evitar erros
 * em comandos de terminal causados por nomes com espaços ou caracteres especiais.
 */
router.post('/upload', upload.single('arquivo'), async (req, res) => {
  const inicio = Date.now();
  const socketId = req.body.socketId as string;
  const file = (req as any).file;
  const { descricao, usuario, clp } = req.body;

  if (!file) {
    res.status(400).json({ error: 'Arquivo não enviado' });
    return;
  }

  if (isReiniciando && usuarioReiniciando !== usuario) {
    res.status(423).json({ error: 'Atualização do CLP em andamento. Aguarde o término antes de enviar arquivos.' });
    return;
  }

  if (isEnviandoArquivo && usuarioEnviando !== usuario) {
    res.status(423).json({ error: 'Outro envio de arquivo está em andamento. Aguarde o término.' });
    return;
  }

  setEnviandoArquivo(true, usuario);

  // 🔐 Gera nome seguro e com extensão garantida
  const nomeSanitizado = garantirExtensao(sanitizarNome(file.originalname));
  const pastaUpload = path.dirname(file.path);
  const novoLocalPath = path.join(pastaUpload, nomeSanitizado);

  try {
    // 📁 Renomeia o arquivo temporário para nome seguro
    await fs.rename(file.path, novoLocalPath);

    // 📤 Envia o arquivo via FTP (local ou proxy, dependendo do ambiente)
    await enviarArquivoFtpUniversal(novoLocalPath, nomeSanitizado, socketId);

    // 📝 Salva o log de upload no banco
    await salvarLogFtpUpload({
      usuario,
      nomeArquivo: file.originalname,
      descricao,
      tamanho: file.size,
      clp
    });

    // 🔊 Notifica o front-end via socket que o upload foi concluído
    getSocket()
      .to(`clp:${clp}`)
      .emit('ftp-upload-completo', { usuario, clp });

    // 🧹 Remove o arquivo temporário
    await fs.unlink(novoLocalPath);

    const duracao = Date.now() - inicio;
    logger.info(`[FTP UPLOAD OK] Arquivo: ${file.originalname} | Usuário: ${usuario} | Tempo: ${duracao}ms`);

    res.json({ sucesso: true });
  } catch (error: any) {
    logger.error('[ERRO UPLOAD]', error);
    res.status(500).json({ error: 'Falha', detalhes: error.message });
  } finally {
    setEnviandoArquivo(false, null);
  }
});

/**
 * Lista os arquivos disponíveis no diretório raiz do FTP.
 */
router.get('/arquivo', async (req, res) => {
  const caminho = '/PLC300/0001/Recipes'; // fixo por enquanto

  try {
    const info = await listarArquivoFtp(caminho);
    res.json({ dados: info });
  } catch (error: any) {
    res.status(500).json({
      mensagem: 'Falha ao listar arquivos',
      detalhes: error.message
    });
  }
});

/**
 * Renomeia um arquivo existente no servidor FTP.
 */
router.patch('/arquivo/renomear', validate(renameFileSchema), async (req, res) => {
  const { antigoNome, novoNome, clp } = req.body;
  try {
    await renomearArquivoFtp(antigoNome, novoNome);

    getSocket()
      .to(`clp:${clp}`)
      .emit('arquivo-renomeado', { antigoNome, novoNome, clp });

    res.json({ sucesso: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Falha ao renomear', detalhes: error.message });
  }
});

/**
 * Remove um arquivo do servidor FTP.
 */
router.delete('/arquivo/:nomeArquivo', validate(fileParamSchema, 'params'), async (req, res) => {
  const nomeArquivo = req.params.nomeArquivo;
  const clp = req.query.clp as string;

  try {
    await excluirArquivoFtp(nomeArquivo);
    getSocket()
      .to(`clp:${clp}`)
      .emit('arquivo-excluido', { nomeArquivo, clp });

    res.json({ sucesso: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Falha ao excluir', detalhes: error.message });
  }
});

/**
 * Consulta o estado global de reinicialização e envio de arquivos.
 */
router.get('/status-global', async (req, res) => {
  res.json({
    clp: {
      reiniciando: isReiniciando,
      iniciadoPor: usuarioReiniciando,
    },
    ftp: {
      enviando: isEnviandoArquivo,
      iniciadoPor: usuarioEnviando,
    },
  });
});

/**
 * Retorna o histórico de uploads realizados via FTP.
 */
router.get('/logs', async (req, res) => {
  try {
    const logs = await listarLogsFtp();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar logs' });
  }
});

/**
 * Garante que o nome do arquivo termine com a extensão desejada (default: .csv)
 *
 * @param nome Nome original do arquivo
 * @param extensao Extensão a ser garantida (default: .csv)
 * @returns Nome final com extensão correta
 */
function garantirExtensao(nome: string, extensao = '.csv') {
  return nome.toLowerCase().endsWith(extensao.toLowerCase()) ? nome : `${nome}${extensao}`;
}

/**
 * Sanitiza o nome do arquivo para evitar falhas no shell.
 *
 * Remove acentos, espaços, parênteses e caracteres especiais, substituindo por underline.
 *
 * @param nome Nome original do arquivo
 * @returns Nome seguro para uso em terminal
 */
function sanitizarNome(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w.-]/g, '_');
}

export default router;
