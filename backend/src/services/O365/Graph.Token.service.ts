import msalApp from '../../config/graph/msalApp.config';

export async function getAppTokenGraph(): Promise<string> {
  const result = await msalApp.acquireTokenByClientCredential({
    scopes: ['https://graph.microsoft.com/.default'],
  });

  if (!result?.accessToken) throw new Error('Erro ao obter token de aplicação');
  return result.accessToken;
}