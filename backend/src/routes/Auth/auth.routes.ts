import { Router, Request, Response } from 'express';
import { cca } from '../../config/Auth/msalUser.config';
import dotenvConfig from '../../config/Auth/dotenv.auth.config';
import dotenv from 'dotenv';
import axios from 'axios';
import { logger } from '../../utils/logger';
import { getFrontendURLFromHost } from '../../utils/env';
import NodeCache from 'node-cache';
import type Redis from 'ioredis';
import { getRedis } from '../../config/Redis/redis.client';

dotenv.config();

const router = Router();
const redirectUri = dotenvConfig.REDIRECT_URI;

const isProd = process.env.NODE_ENV === 'production';

// Cache em memória para DEV
const memCache = new NodeCache({ stdTTL: 3600 /* segundos */ });

const PHOTO_TTL_SECONDS = 3600; // 1h
const PHOTO_NONE = '__NO_PHOTO__';

function photoKey(userId: string) {
  return `user:photo:${userId}`;
}

// Só obtem o client Redis em produção (evita ECONNREFUSED no dev)
function getRedisIfProd(): Redis | null {
  if (!isProd) return null;
  try {
    return getRedis();
  } catch (e) {
    // Se der erro ao criar cliente em prod, loga e segue (evita derrubar rota)
    logger.error(`[photo-cache] Falha ao obter Redis em produção: ${(e as Error)?.message}`);
    return null;
  }
}

/**
 * Inicia o fluxo de autenticação redirecionando o usuário para a Microsoft.
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
 */
router.get('/redirect', async (req: Request, res: Response) => {
  const tokenRequest = {
    code: req.query.code as string,
    scopes: ['user.read', 'GroupMember.Read.All'],
    redirectUri,
  };

  try {
    // Troca código por tokens
    const response = await cca.acquireTokenByCode(tokenRequest);

    // Claims
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

    // Grupos
    const groupsRes = await axios.get<{ value: Array<{ id: string; displayName: string; resourceProvisioningOptions: string[] }> }>(
      `https://graph.microsoft.com/v1.0/me/memberOf?$select=id,displayName,resourceProvisioningOptions`,
      { headers: { Authorization: `Bearer ${response.accessToken}` } }
    );

    const grupos: Array<{ nome: string }> = groupsRes.data.value
      .filter((g: any) =>
        g['@odata.type'] === '#microsoft.graph.group' &&
        g.resourceProvisioningOptions?.includes('Team') &&
        g.displayName !== 'Informativos'
      )
      .map((g: any) => ({ nome: g.displayName }));

    // Perfil básico
    const userProfileResponse = await axios.get<{ displayName: string; mail: string }>(
      'https://graph.microsoft.com/v1.0/me?$select=displayName,mail',
      { headers: { Authorization: `Bearer ${response.accessToken}` } }
    );
    const userEmail = userProfileResponse.data.mail || '';
    const userName = userProfileResponse.data.displayName || '';

    // Foto de perfil -> salva no Redis (prod) ou NodeCache (dev)
    try {
      const photoResponse = await axios.get('https://graph.microsoft.com/v1.0/me/photo/$value', {
        headers: { Authorization: `Bearer ${response.accessToken}` },
        responseType: 'arraybuffer',
      });

      const contentType = photoResponse.headers['content-type'] || 'image/jpeg';
      const photoBase64 = Buffer.from(photoResponse.data, 'binary').toString('base64');

      const redis = getRedisIfProd();
      if (redis) {
        await redis.set(photoKey(userOid), JSON.stringify({ data: photoBase64, contentType }), 'EX', PHOTO_TTL_SECONDS);
      } else {
        memCache.set(photoKey(userOid), { data: photoBase64, contentType }, PHOTO_TTL_SECONDS);
      }
      // logger.info('Foto salva no cache');
    } catch (photoError) {
      if (axios.isAxiosError(photoError)) {
        if (photoError.response?.status === 404) {
          // Cache negativo (evita bater no Graph repetidamente)
          const redis = getRedisIfProd();
          if (redis) {
            await redis.set(photoKey(userOid), PHOTO_NONE, 'EX', 600); // 10 min
          } else {
            memCache.set(photoKey(userOid), PHOTO_NONE, 600);
          }
        } else {
          logger.warn(`Erro ao buscar imagem de perfil: ${photoError.response?.status || photoError.message}`);
        }
      } else {
        logger.warn(`Erro inesperado ao buscar imagem de perfil: ${(photoError as Error).message}`);
      }
    }

    // Cookie de sessão
    const user = { name: userName, email: userEmail, id: userOid, grupos };

    res.cookie('session', JSON.stringify(user), {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 1 * 60 * 60 * 1000,
    });

    // Redireciona para o frontend correto
    const hostHeader = req.headers.host || '';
    const frontendURL = getFrontendURLFromHost(hostHeader);
    res.redirect(`${frontendURL}/login/login-success`);
  } catch (error) {
    logger.error('Erro ao processar callback:', error);
    res.status(500).send('Erro ao completar login');
  }
});

/**
 * Logout.
 */
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('session');
  res.sendStatus(200);
});

/**
 * Middleware de sessão.
 */
export function sessionGuard(req: Request, res: Response, next: Function) {
  const session = req.cookies?.session;
  if (!session) {
    res.status(401).send('Não autenticado');
    return;
  }
  try {
    req.user = JSON.parse(session);
    next();
  } catch {
    res.status(400).send('Sessão inválida');
  }
}

/**
 * Dados da sessão.
 */
router.get('/me', sessionGuard, (req: Request, res: Response) => {
  res.json(req.user);
});

/**
 * Foto de perfil (cache compartilhado via Redis em prod; memória em dev).
 */
router.get('/user/photo', sessionGuard, async (req: Request, res: Response) => {
  const session = req.cookies?.session;
  try {
    const user = JSON.parse(session);
    const key = photoKey(user.id);
    const redis = getRedisIfProd();

    let record: any = null;

    if (redis) {
      const raw = await redis.get(key);
      if (!raw || raw === PHOTO_NONE) {
        res.status(404).send('Foto não encontrada');
        return;
      }
      record = JSON.parse(raw);
    } else {
      const v = memCache.get(key);
      if (!v || v === PHOTO_NONE) {
        res.status(404).send('Foto não encontrada');
        return;
      }
      record = v; // já é { data, contentType }
    }

    const { data, contentType } = record as { data: string; contentType: string };

    // ETag simples baseada em parte do base64
    const etag = `"${Buffer.from(data).subarray(0, 16).toString('base64')}"`;
    if (req.headers['if-none-match'] === etag) {
      res.status(304).end();
      return;
    }

    res.setHeader('Content-Type', contentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min no browser
    res.setHeader('ETag', etag);

    res.send(Buffer.from(data, 'base64'));
  } catch {
    res.status(400).send('Sessão inválida');
  }
});

export default router;
