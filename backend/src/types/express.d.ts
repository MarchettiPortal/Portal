import { User } from './auth';
import 'express-session';
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    tokens?: {
      accessToken: string;
      refreshToken?: string;
    };
  }
}

declare module 'express' {
  interface Request {
    user?: {
      oid: string;
      name?: string;
      email?: string;
      groups?: string[];
      officeLocation?: string;
    };
    session?: {
      tokens?: {
        accessToken: string;
        [key: string]: any;
      };
    };
  }
}