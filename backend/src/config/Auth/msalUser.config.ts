import { ConfidentialClientApplication, Configuration } from '@azure/msal-node';
import dotenvConfig from './dotenv.auth.config';

// Configuração MSAL com clientId, tenant e clientSecret
const config: Configuration = {
  auth: {
    clientId: dotenvConfig.CLIENT_ID,
    authority: dotenvConfig.TENANT_ID,
    clientSecret: dotenvConfig.CLIENT_SECRET,
  },
};

// Exporta uma instância do cliente confidencial MSAL
export const cca = new ConfidentialClientApplication(config);