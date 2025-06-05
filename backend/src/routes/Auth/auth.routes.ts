// src/routes/auth.routes.ts
import { Router, Request, Response } from 'express';
import { cca } from '../../config/Auth/msalUser.config';
import { config } from '../../config/Global/global.config'
import dotenvConfig from '../../config/Auth/dotenv.auth.config';
import dotenv from 'dotenv';
import axios from 'axios';
import NodeCache from 'node-cache';

dotenv.config();

const imageCache = new NodeCache({ stdTTL: 3600 }); // Cache por 1 hora
const router = Router();
const redirectUri = dotenvConfig.REDIRECT_URI;


// 1. Início do login: redireciona para a Microsoft
router.get('/login', async (req: Request, res: Response) => {
  const authCodeUrlParameters = {
    scopes: ['user.read', 'openid', 'profile', 'email', 'GroupMember.Read.All'],
    redirectUri,
  };

  try {
    const authUrl = await cca.getAuthCodeUrl(authCodeUrlParameters);
    res.redirect(authUrl);
  } catch (error) {
    console.error('Erro ao gerar URL de login:', error);
    res.status(500).send('Erro ao redirecionar para login Microsoft');
  }
});


// 2. Callback após autenticação na Microsoft
router.get('/redirect', async (req: Request, res: Response) => {
  const tokenRequest = {
    code: req.query.code as string,
    scopes: ['user.read', 'GroupMember.Read.All'],
    redirectUri,
  };

  try {
    // ************** CONEXÃO E TROCA DE TOKEN DO MSAL **************
    const response = await cca.acquireTokenByCode(tokenRequest); 


    // ************** EXTRAÇÃO E VALIDAÇÃO **************
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

    // ************** BUSCAR DADOS DO GRUPO **************
    const groupsRes = await axios.get<{ value: Array<{ id: string; displayName: string }> }>(
      `https://graph.microsoft.com/v1.0/me/memberOf?$select=id,displayName,resourceProvisioningOptions`,
      {
        headers: { Authorization: `Bearer ${response.accessToken}` }
      }
    );

    const grupos: Array<{ id: string; nome: string }> = groupsRes.data.value
      .filter((g: any) =>
        g['@odata.type'] === '#microsoft.graph.group' &&
        g.resourceProvisioningOptions?.includes('Team')
      )
      .map((g: any) => ({ id: g.id, nome: g.displayName }));


    // ************** BUSCA DADOS DO USUARIO **************
    const userProfileResponse = await axios.get<{ displayName: string; mail: string }>(
          'https://graph.microsoft.com/v1.0/me?$select=displayName,mail',
          { headers: { Authorization: `Bearer ${response.accessToken}` } }
        );
    const userEmail = userProfileResponse.data.mail || '';
    const userName = userProfileResponse.data.displayName || '';
    

    // ************** IMAGEM PERFIL **************
    try {
      const photoResponse = await axios.get('https://graph.microsoft.com/v1.0/me/photo/$value', {
        headers: { Authorization: `Bearer ${response.accessToken}` },
        responseType: 'arraybuffer',
      });

      const photoBuffer = Buffer.from(photoResponse.data, 'binary');
      const photoBase64 = photoBuffer.toString('base64');

      imageCache.set(claims.oid, photoBase64);
      //console.log('foto salva no cache')
    } catch (photoError) {
      if (axios.isAxiosError(photoError)) {
        console.warn('Erro ao buscar imagem de perfil:', photoError.response?.status || photoError.message);
      } else {
        console.warn('Erro inesperado ao buscar imagem de perfil:', (photoError as Error).message);
      }
    }

    // ************** APLICAÇÃO DOS VALORES NAS VARIÁVEIS DO COOKIE **************
    const user = {
      name: userName,
      email: userEmail,
      id: userOid,
      grupos: grupos,
    };

    console.log('Usuário autenticado:', user.name, user.id, user.grupos, user.email);

    
    // ************** CRIAÇÃO DO COOKIE **************
    res.cookie('session', JSON.stringify(user), {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1 * 60 * 60 * 1000,
    });

    // ************** REDIRECIONAMENTO PARA O FRONTEND **************
    res.redirect(`${config.BASE_URL_FRONTEND}/login/login-success`);
  } catch (error) {
    console.error('Erro ao processar callback:', error);
    res.status(500).send('Erro ao completar login');
  }
});

// ************** 3. Logout: limpa o cookie de sessão **************
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('session');
  res.sendStatus(200);
});


// ************** 4. Middleware: verifica se o usuário está logado **************
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
  
  // 5. Rota protegida: retorna dados da sessão (usada pelo frontend)
  router.get('/me', sessionGuard, (req: Request, res: Response) => {

    res.json(req.user);
  });



  // 6. ************** IMAGEM CACHE **************
  router.get('/user/photo', (req: Request, res: Response) => {
    const session = req.cookies?.session;

    if (!session){
      res.status(401).send('Não autenticado');
      return;
    } 

    try {
      const user = JSON.parse(session);
      const cachedPhoto = imageCache.get(user.oid);

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
