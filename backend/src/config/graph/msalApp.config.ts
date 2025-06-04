import { ConfidentialClientApplication } from '@azure/msal-node';
import dotenvConfig  from '../Auth/dotenv.auth.config'

const msalApp = new ConfidentialClientApplication({
  auth: {
    clientId: dotenvConfig.CLIENT_ID,
    authority: dotenvConfig.TENANT_ID,
    clientSecret: dotenvConfig.CLIENT_SECRET,
  },
});

export default msalApp;
