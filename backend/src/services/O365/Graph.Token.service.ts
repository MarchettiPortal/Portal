import msalApp from '../../config/graph/msalApp.config';

/**
 * Obtém um token de aplicação do Microsoft Graph usando client credentials.
 *
 * @returns Token de acesso para chamadas ao Graph API.
 */
export async function getAppTokenGraph(): Promise<string> {
  const result = await msalApp.acquireTokenByClientCredential({
    scopes: ['https://graph.microsoft.com/.default'],
  });

  if (!result?.accessToken) throw new Error('Erro ao obter token de aplicação');
  return result.accessToken;
}