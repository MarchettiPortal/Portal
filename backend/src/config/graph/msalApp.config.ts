import { ConfidentialClientApplication } from '@azure/msal-node';
import dotenvConfig  from '../Auth/dotenv.auth.config'

/**
 * Configuração MSAL com clientId, tenant e clientSecret para MSAL Application
 * 
 * Export da configuração
 */
const msalApp = new ConfidentialClientApplication({
  auth: {
    clientId: dotenvConfig.CLIENT_ID,
    authority: dotenvConfig.TENANT_ID,
    clientSecret: dotenvConfig.CLIENT_SECRET,
  },
});

export default msalApp;
