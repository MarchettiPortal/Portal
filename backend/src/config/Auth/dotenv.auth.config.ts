import "dotenv/config";

import { config } from '../Global/global.config';


const REDIRECT_URI_IMPORTED = config.BASE_URL_BACKEND;

// Importando os valores do .env
const dotenvConfig = {
    CLIENT_ID: process.env.CLIENT_ID!,
    CLIENT_SECRET: process.env.CLIENT_SECRET!,
    TENANT_ID: process.env.TENANT_ID!,
    REDIRECT_URI: `${config.BASE_URL_BACKEND}${process.env.REDIRECT_URI}`,
    SESSION_SECRET:process.env.SESSION_SECRET!,
    ADMIN_GROUP_ID:process.env.ADMIN_GROUP_ID!,
    JWT_SECRET:process.env.JWT_SECRET!,
    NODE_ENV:process.env.NODE_ENV!,
};

export default dotenvConfig;
