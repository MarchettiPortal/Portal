import { Router } from 'express';
import { getSocket } from '../../socket';
import { enviarArquivoFtp, listarArquivoFtp, renomearArquivoFtp, excluirArquivoFtp  } from '../../services/FTP/FTP.Client.service'
import { salvarLogFtpUpload, listarLogsFtp } from '../../services/FTP/FTP.LOG.service'
import multer from 'multer';
import { promises as fs } from 'fs';
import { isReiniciando, usuarioReiniciando, isEnviandoArquivo, usuarioEnviando, setEnviandoArquivo } from '../../flags/wpsFTP';
import { validate } from '../../middleware/validate';
import { renameFileSchema, fileParamSchema } from '../../validators/ftp';
import { logger } from '../../utils/logger';


const upload = multer({ dest: 'uploads/' });
const router = Router();


// *** FTP ***
/**
 * Upload de arquivos para o servidor FTP.
 *
 * Utiliza Multer para receber o arquivo e envia feedback de progresso via
 * Socket.IO.
 */
router.post('/upload', upload.single('arquivo'), async (req, res) => {
  const inicio = Date.now(); // marca início
  const socketId = req.headers['x-socket-id'] as string  // header customizado
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

  const localPath = file.path;
  const remotePath = `${file.originalname}`;

  try {
    await enviarArquivoFtp(localPath, remotePath, socketId);
    
    await salvarLogFtpUpload({
      usuario,
      nomeArquivo: file.originalname,
      descricao,
      tamanho: file.size,
      clp
    });
    // Emite para todos os usuários no front que o arquivo foi Enviado
    getSocket()
      .to(`clp:${clp}`)
      .emit('ftp-upload-completo', { usuario, clp })

    await fs.unlink(localPath); // Remove arquivo local temporário

    const duracao = Date.now() - inicio;
    logger.info(`[FTP UPLOAD OK] Arquivo: ${file.originalname} | Usuário: ${usuario} | Tempo: ${duracao}ms`);
    
    res.json({ sucesso: true }); // ✅ ÚNICO ponto que envia resposta
  } catch (error: any) {
    logger.error('[ERRO UPLOAD]', error);
    res.status(500).json({ error: 'Falha', detalhes: error.message });
  } finally{
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

    // Emite para todos os usuários no front que o arquivo foi Renomeado
    getSocket()
      .to(`clp:${clp}`)
      .emit('arquivo-renomeado', { antigoNome, novoNome, clp })

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
  const clp = req.query.clp as string 

  try {
    await excluirArquivoFtp(nomeArquivo);
    // Emite para todos os usuários no front que o arquivo foi Excluido
    getSocket()
      .to(`clp:${clp}`)
      .emit('arquivo-excluido', { nomeArquivo, clp })

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




export default router;