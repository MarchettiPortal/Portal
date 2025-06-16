export interface User {
  /** Identificador único (OID do Azure AD) */
  id: string;
  /** Nome completo do usuário */
  name: string;
  /** E-mail principal do usuário */
  email: string;
  /** Lista de grupos (somente os nomes, sem “Informativos”) */
  grupos: string[];
  /** URL do blob da foto de perfil (ou caminho do placeholder) */
  photo: string;
}
