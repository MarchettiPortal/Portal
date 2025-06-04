import { Router } from 'express';
import { getClpStatus, setClpConfig, checkServiceHealth } from '../services/CLP/CLP.Att.service'
import { enviarArquivoFtp, listarArquivoFtp } from '../services/FTP/FTP.Client.service'
import { salvarLogFtpUpload, listarLogsFtp } from '../services/FTP/FTP.LOG.service'
import multer from 'multer';
import fs from 'fs';
import { pool } from '../config/Global/db.config';
import {
  isReiniciando,
  usuarioReiniciando,
  isEnviandoArquivo,
  usuarioEnviando,
  setEnviandoArquivo,
} from '../flags/wpsFTP';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Serviço Remoto: Retorna qual CLP está setado
router.get('/status', getClpStatus);
// Serviço Remoto: Altera IP do CLP e reinicia app
router.post('/set', setClpConfig);
// Serviço Remoto: Check se o Serviço Remoto está ativo
router.get('/health', checkServiceHealth);
// Serviço Remoto: Status de Loading do reinício do WPS



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

    fs.unlinkSync(localPath); // Remove arquivo local temporário

    res.json({ sucesso: true }); // ✅ ÚNICO ponto que envia resposta
  } catch (error: any) {
    console.error('[ERRO UPLOAD]', error);
    res.status(500).json({ error: 'Falha', detalhes: error.message });
  } finally{
    setEnviandoArquivo(false, null);
  }
});

router.get('/arquivo', async (req, res) => {
    try {
        const info = await listarArquivoFtp('/destino');
        res.json(info);
    } catch (error: any) {
        res.status(500).json({ error: 'Falha', detalhes: error.message });
    }
});

router.get('/logs', async (req, res) => {
  try {
    const logs = await listarLogsFtp();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar logs' });
  }
});

router.get('/ultimo-log', async (req, res) => {
  const { clp } = req.query

  if (!clp || typeof clp !== 'string') {
    res.status(400).json({ error: 'Parâmetro "clp" é obrigatório e deve ser string.' })
    return;
  }

  try {
    const result = await pool.query(
      `
      SELECT * FROM "ftp_upload_logs"
      WHERE "clp_selecionado" = $1
      ORDER BY "data_envio" DESC
      LIMIT 1
      `,
      [clp]
    )

    res.json(result.rows[0] || {})
  } catch (e) {
    console.error('Erro ao buscar log:', e)
    res.status(500).json({ error: 'Erro ao buscar log' })
  }
})

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


export default router;