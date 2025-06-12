export interface IdTokenClaims {
  name?: string;
  preferred_username?: string;
  oid?: string;
  officeLocation: string;

  [key: string]: unknown; // Para propriedades adicionais
}

export interface AuthResponse {
  idTokenClaims?: IdTokenClaims;
  // Adicione outras propriedades da resposta se necessário
}

export interface UserSession {
  name: string;
  email: string;
  oid: string;

}

// Extensão do tipo Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: UserSession;

    }
  }
}