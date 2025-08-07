import os from 'os'
import axios from 'axios'
import { enviarArquivoFtp } from './FTP.Client.service'
import FormData from 'form-data'
import fs from 'fs'

export async function enviarArquivoFtpUniversal(
  localPath: string,
  remotePath: string,
  socketId?: string
): Promise<void> {
  const hostname = os.hostname()
  const isProd = hostname === 'sv-intranet-aplicacao'

  if (isProd) {
    // ✅ Execução local via LFTP no Ubuntu
    return enviarArquivoFtp(localPath, remotePath, socketId)
  }

  // 🌐 Execução remota via proxy API (aponta para servidor Ubuntu)
  const formData = new FormData()
  formData.append('localPath', localPath)
  formData.append('remotePath', remotePath)
  formData.append('socketId', socketId || '')
  formData.append('arquivo', fs.createReadStream(localPath))

  await axios.post(
    'https://portalti.molasmarchetti.com.br/api/ftp/upload-proxy',
    formData,
    {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 5 * 60 * 1000 // 5 minutos
    }
  )
}
