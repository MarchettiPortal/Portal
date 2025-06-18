import { promises as fs } from 'fs';

export async function getHttpsConfig() {
  return {
    key: await fs.readFile('src/cert/key.key'),
    cert: await fs.readFile('src/cert/cert.crt'),
    ca: await fs.readFile('src/cert/ca.crt'),
  };
}