import session from 'express-session';
import dotenvConfig from './dotenv.auth.config';

/**
 * Configurações padrão da sessão utilizada pelo Express.
 */
export const sessionConfig = {
  secret: dotenvConfig.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas, ajustar em produção
  }
};