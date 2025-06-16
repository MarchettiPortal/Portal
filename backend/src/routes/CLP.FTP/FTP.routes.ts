import { Router } from 'express';
import { getSocket } from '../../socket';
import { enviarArquivoFtp, listarArquivoFtp, renomearArquivoFtp, excluirArquivoFtp } from '../../services/FTP/FTP.Client.service'
import { salvarLogFtpUpload, listarLogsFtp } from '../../services/FTP/FTP.LOG.service'
import multer from 'multer';
import fs from 'fs';
import { isReiniciando, usuarioReiniciando, isEnviandoArquivo, usuarioEnviando, setEnviandoArquivo } from '../../flags/wpsFTP';

const upload = multer({ dest: 'uploads/' });
const router = Router();


// *** FTP ***
//  Rota para enviar os arquivos no acesso FTP
router.post('/upload', upload.single('arquivo'), async (req, res) => {
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

    fs.unlinkSync(localPath); // Remove arquivo local temporário
    res.json({ sucesso: true }); // ✅ ÚNICO ponto que envia resposta
  } catch (error: any) {
    console.error('[ERRO UPLOAD]', error);
    res.status(500).json({ error: 'Falha', detalhes: error.message });
  } finally{
    setEnviandoArquivo(false, null);
  }
});

//  Rota para listar os arquivos no acesso FTP
router.get('/arquivo', async (req, res) => {
    try {
        const info = await listarArquivoFtp('/');
        res.json({
            dados: info
        });
    } catch (error: any) {
        res.status(500).json({
            mensagem: 'Falha ao listar arquivos',
            detalhes: error.message
        });
    }
});

//  Rota para Renomear arquivo no acesso FTP
router.patch('/arquivo/renomear', async (req, res) => {
  const { antigoNome, novoNome, clp } = req.body;
  if (!antigoNome || !novoNome) {
    res.status(400).json({ error: 'Nomes inválidos' });
    return;
  }

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

//  Rota para excluir arquivo no acesso FTP
router.delete('/arquivo/:nomeArquivo', async (req, res) => {
  const nomeArquivo = req.params.nomeArquivo;
  const clp = req.query.clp as string  // ou inclua no body se preferir
  if (!nomeArquivo) {
    res.status(400).json({ error: 'Nome do arquivo não fornecido' });
    return;
  }
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

// Rota para validar se alguém está reiniciando o WPS ou Enviando um FTP para bloquear novas tentativas até finalizar
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

// Lista os Logs do FTP no banco de dados para o frontend
router.get('/logs', async (req, res) => {
  try {
    const logs = await listarLogsFtp();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar logs' });
  }
});


export default router;