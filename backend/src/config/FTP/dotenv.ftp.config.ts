import 'dotenv/config';
import { getEnvVar } from '../../utils/env';

/**
 * Valores padrão de FTP
 * 
 * Export dos valores
 */
const dotenvConfig = {
    host: getEnvVar('FTP_HOST'),
    user: getEnvVar('FTP_USER'),
    password: getEnvVar('FTP_PASS'),
    port: parseInt(getEnvVar('FTP_PORT'), 10)
};

export default dotenvConfig;