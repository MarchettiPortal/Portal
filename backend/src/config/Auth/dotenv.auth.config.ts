import 'dotenv/config';
import { getEnvVar } from '../../utils/env';
import { config } from '../Global/global.config';


//const REDIRECT_URI_IMPORTED = config.BASE_URL_BACKEND;

// Importando os valores do .env
const dotenvConfig = {
    CLIENT_ID: getEnvVar('CLIENT_ID'),
    CLIENT_SECRET: getEnvVar('CLIENT_SECRET'),
    TENANT_ID: getEnvVar('TENANT_ID'),
    REDIRECT_URI: `${config.BASE_URL_BACKEND}${getEnvVar('REDIRECT_URI')}`,
    SESSION_SECRET: getEnvVar('SESSION_SECRET'),
    ADMIN_GROUP_ID: getEnvVar('ADMIN_GROUP_ID'),
    JWT_SECRET: getEnvVar('JWT_SECRET'),
    NODE_ENV: process.env.NODE_ENV || 'development',
};

export default dotenvConfig;
