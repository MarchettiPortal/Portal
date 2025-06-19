export interface ADGrupo {
  id: string;
  nome: string;
}

export interface ADUser {
  id: string;
  name: string;
  email: string;
  groups: ADGrupo[];
  licencas?: string[];
  ativo?: boolean;
  servicos?: boolean;
  recursos?: boolean;
}

export interface GraphUser {
  id: string;
  displayName: string;
  mail: string;
  assignedLicenses: unknown[];
  accountEnabled: boolean;
  userPrincipalName: string;
}

export interface GraphGroup {
  id: string;
  displayName: string;
}

export interface GraphResponse<T> {
  value: T[];
  '@odata.nextLink'?: string;
}