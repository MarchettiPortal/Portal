import { promises as fs } from 'fs';

/**
 * Carrega os certificados utilizados pelo servidor HTTPS.
 *
 * @returns Objeto contendo chave, certificado e cadeia de certificação
 */
export async function getHttpsConfig() {
  return {
    key: await fs.readFile('src/cert/key.key'),
    cert: await fs.readFile('src/cert/cert.crt'),
    ca: await fs.readFile('src/cert/ca.crt'),
  };
}