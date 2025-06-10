import { Router } from 'express';
import { getClpStatus, setClpConfig, checkServiceHealth } from '../../services/CLP/CLP.Att.service'
import { enviarArquivoFtp, listarArquivoFtp, renomearArquivoFtp, excluirArquivoFtp } from '../../services/FTP/FTP.Client.service'
import { salvarLogFtpUpload, listarLogsFtp } from '../../services/FTP/FTP.LOG.service'
import multer from 'multer';
import fs from 'fs';
import { pool } from '../../config/Global/db.config';
import {
  isReiniciando,
  usuarioReiniciando,
  isEnviandoArquivo,
  usuarioEnviando,
  setEnviandoArquivo,
} from '../../flags/wpsFTP';
import { listarClps, adicionarClp, removerClp, atualizarOpcaoCLP,  } from '../../controllers/CLP/CLP.Controller';
const router = Router();
const upload = multer({ dest: 'uploads/' });

// *** CLP ***
// Serviço Remoto: Retorna qual CLP está setado
router.get('/status', getClpStatus);
// Serviço Remoto: Altera IP do CLP e reinicia app
router.post('/set', setClpConfig);
// Serviço Remoto: Check se o Serviço Remoto está ativo
router.get('/health', checkServiceHealth);

// Chamadas CLP x Banco de Dados
router.get('/list', listarClps) // Lista os CLP's no banco de dados
router.post('/add', adicionarClp) // Adicionar CLP's no banco de dados
router.delete('/del/:id', removerClp) // Remove CLP's no banco de dados
router.patch('/edit/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  const { label, value, sistema_clp } = req.body

  if (!label || !value) {
    res.status(400).json({ error: 'Campos obrigatórios: label, value' })
    return
  }

  try {
    await atualizarOpcaoCLP(id, { label, value, sistema_clp })
    res.status(200).json({ success: true, message: 'CLP atualizado com sucesso' })
  } catch (error) {
    console.error('Erro ao atualizar CLP:', error)
    res.status(500).json({ error: 'Erro interno ao atualizar CLP' })
  }
})

// *** FTP ***

// Envio do arquivo ao CLP selecionado via FTP
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

// Listar arquivos dentro do CLP selecionado via FTP
router.get('/arquivo', async (req, res) => {
    try {
        const info = await listarArquivoFtp('/');
        res.json({
            sucesso: true,
            dados: info
        });
    } catch (error: any) {
        res.status(500).json({
            sucesso: false,
            mensagem: 'Falha ao listar arquivos',
            detalhes: error.message
        });
    }
});

// 🔥 Rota para renomear arquivo
router.patch('/arquivo/renomear', async (req, res) => {
  const { antigoNome, novoNome } = req.body;
  if (!antigoNome || !novoNome) {
    res.status(400).json({ error: 'Nomes inválidos' });
    return;
  }

  try {
    await renomearArquivoFtp(antigoNome, novoNome);
    res.json({ sucesso: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Falha ao renomear', detalhes: error.message });
  }
});

// 🔥 Rota para excluir arquivo
router.delete('/arquivo/:nomeArquivo', async (req, res) => {
  const nomeArquivo = req.params.nomeArquivo;
  if (!nomeArquivo) {
    res.status(400).json({ error: 'Nome do arquivo não fornecido' });
    return;
  }

  try {
    await excluirArquivoFtp(nomeArquivo);
    res.json({ sucesso: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Falha ao excluir', detalhes: error.message });
  }
});





// Logs e processos relacionados a banco de dados
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