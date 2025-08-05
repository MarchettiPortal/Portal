import fs from 'fs';
import path from 'path';
import https from 'https';
import dotenvConfig from '../../config/Milvus/dotenv.milvus.config.js';

/**
 * Realiza o download do arquivo CSV de SLA do Milvus.
 *
 * @returns Promessa resolvida quando o arquivo for baixado e salvo.
 * @throws Erros de rede ou gravação em disco.
 */
export async function downloadCSV(): Promise<void> {
    const url = dotenvConfig.URL_CSV_MLVUS;
    const AUTH_TOKEN = dotenvConfig.API_MILVUS;
    const requestData = JSON.stringify({ 
        nome: 'SLA-Infraestrutura', tipo: 'csv' 
    });
    
    const outputPath = dotenvConfig.PATH_CSV_SLA;

    const options = {
        method: 'POST',
        headers: {
            'Authorization': AUTH_TOKEN,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestData),
        },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Erro: Código de status ${res.statusCode}`));
                return;
            }

            const fileStream = fs.createWriteStream(outputPath);
            res.pipe(fileStream);

            fileStream.on('finish', () => {
                //logger.log('Arquivo baixado com sucesso:', outputPath);
                fileStream.close();
                resolve(); // Resolve a Promise quando o download termina
            });

            fileStream.on('error', (err) => {
                reject(new Error(`Erro ao salvar o arquivo: ${err.message}`));
            });
        });

        req.on('error', (err) => {
            reject(new Error(`Erro na requisição: ${err.message}`));
        });

        req.write(requestData);
        req.end();
    });
}