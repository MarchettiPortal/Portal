import { Router, Request, Response } from 'express';
import { cca } from '../../config/Auth/msalUser.config';
import { config } from '../../config/Global/global.config'
import dotenvConfig from '../../config/Auth/dotenv.auth.config';
import dotenv from 'dotenv';
import axios from 'axios';
import NodeCache from 'node-cache';
import { logger } from '../../utils/logger';

dotenv.config();

/**
 * Cache das fotos de perfil em base64 por até uma hora.
 */
const imageCache = new NodeCache({ stdTTL: 3600 });

const router = Router();
const redirectUri = dotenvConfig.REDIRECT_URI;


/**
 * Inicia o fluxo de autenticação redirecionando o usuário para a Microsoft.
 *
 * @param req Requisição Express.
 * @param res Resposta Express utilizada para redirecionar.
 */
router.get('/login', async (req: Request, res: Response) => {
  const authCodeUrlParameters = {
    scopes: ['user.read', 'openid', 'profile', 'email', 'GroupMember.Read.All'],
    redirectUri,
  };

  try {
    const authUrl = await cca.getAuthCodeUrl(authCodeUrlParameters);
    res.redirect(authUrl);
  } catch (error) {
    logger.error('Erro ao gerar URL de login:', error);
    res.status(500).send('Erro ao redirecionar para login Microsoft');
  }
});


/**
 * Callback da autenticação da Microsoft. Gera cookie de sessão e redireciona o usuário.
 *
 * @param req Requisição contendo o código de autorização.
 * @param res Resposta usada para criar o cookie e redirecionar.
 */
router.get('/redirect', async (req: Request, res: Response) => {
  const tokenRequest = {
    code: req.query.code as string,
    scopes: ['user.read', 'GroupMember.Read.All'],
    redirectUri,
  };

  try {
    // Conecta ao MSAL e troca o código de autorização por tokens
    const response = await cca.acquireTokenByCode(tokenRequest); 

    // Extrai e valida as claims do token obtido
    const claims = response?.idTokenClaims as {
      name?: string;
      preferred_username?: string;
      oid?: string;
    };

    if (!claims?.oid) {
      res.status(401).send('Login inválido');
      return;
    }
    const userOid = claims.oid as string;

    // Recupera os grupos do usuário autenticado
    const groupsRes = await axios.get<{ value: Array<{ id: string; displayName: string; resourceProvisioningOptions: string[] }> }>(
      `https://graph.microsoft.com/v1.0/me/memberOf?$select=id,displayName,resourceProvisioningOptions`,
      {
        headers: { Authorization: `Bearer ${response.accessToken}` }
      }
    );

    const grupos: Array<{ nome: string }> = groupsRes.data.value
      .filter((g: any) =>
        g['@odata.type'] === '#microsoft.graph.group' &&
        g.resourceProvisioningOptions?.includes('Team') &&
        g.displayName !== 'Informativos'
      )
      .map((g: any) => ({nome: g.displayName }));

    
    // Consulta dados básicos do usuário
    const userProfileResponse = await axios.get<{ displayName: string; mail: string }>(
          'https://graph.microsoft.com/v1.0/me?$select=displayName,mail',
          { headers: { Authorization: `Bearer ${response.accessToken}` } }
        );
    const userEmail = userProfileResponse.data.mail || '';
    const userName = userProfileResponse.data.displayName || '';
    

    // Faz o download da imagem de perfil
    try {
      const photoResponse = await axios.get('https://graph.microsoft.com/v1.0/me/photo/$value', {
        headers: { Authorization: `Bearer ${response.accessToken}` },
        responseType: 'arraybuffer',
      });

      const photoBuffer = Buffer.from(photoResponse.data, 'binary');
      const photoBase64 = photoBuffer.toString('base64');

      imageCache.set(claims.oid, photoBase64);
      //logger.log('foto salva no cache')
    } catch (photoError) {
      if (axios.isAxiosError(photoError)) {
        logger.warn(`Erro ao buscar imagem de perfil: ${photoError.response?.status || photoError.message}`);
      } else {
        logger.warn(`Erro inesperado ao buscar imagem de perfil: ${(photoError as Error).message}`);
      }
    }

    // Grava cookie de sessão para autenticação posterior
    const user = {
      name: userName,
      email: userEmail,
      id: userOid,
      grupos,
    };

    //logger.log('Usuário autenticado:', user.name, user.id, user.grupos, user.email);

    
    // Grava cookie de sessão para autenticação posterior
    res.cookie('session', JSON.stringify(user), {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1 * 60 * 60 * 1000,
    });

    // Redireciona usuário autenticado para o frontend
    res.redirect(`${config.BASE_URL_FRONTEND}/login/login-success`);
  } catch (error) {
    logger.error('Erro ao processar callback:', error);
    res.status(500).send('Erro ao completar login');
  }
});

/**
 * Finaliza a sessão removendo o cookie armazenado no navegador.
 *
 * @param req Requisição Express.
 * @param res Resposta confirmando a operação.
 */
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('session');
  res.sendStatus(200);
});


/**
 * Middleware que valida a existência de um cookie de sessão.
 *
 * @param req Requisição Express com possível cookie de sessão.
 * @param res Resposta utilizada em caso de falha.
 * @param next Próxima função de middleware.
 */
export function sessionGuard(req: Request, res: Response, next: Function) {
    const session = req.cookies?.session;
    if (!session){
        res.status(401).send('Não autenticado') 
        return};
  
    try {
      req.user = JSON.parse(session);
      next();
    } catch {
      res.status(400).send('Sessão inválida');
    }
  }
  
/**
 * Rota protegida que retorna os dados da sessão do usuário autenticado.
 */
  router.get('/me', sessionGuard, (req: Request, res: Response) => {

    res.json(req.user);
  });



/**
 * Recupera a foto de perfil armazenada em cache para o usuário autenticado.
 */
  router.get('/user/photo', sessionGuard, (req: Request, res: Response) => {
    const session = req.cookies?.session;

    try {
      const user = JSON.parse(session);
      const cachedPhoto = imageCache.get(user.id);

      if (!cachedPhoto || typeof cachedPhoto !== 'string') {
        res.status(404).send('Foto não encontrada');
        return; 
      }
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(Buffer.from(cachedPhoto, 'base64'));

    } catch {
      res.status(400).send('Sessão inválida');
    }
  });

export default router;
