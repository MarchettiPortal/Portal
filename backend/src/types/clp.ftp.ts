export interface ClpOpcao {
  id: number
  label: string
  value: string
  sistema_clp: string
}

export interface ClpOpcaoPayload {
  nome: string
  ip: string
  ativo: boolean
  sistema_clp?: string
}

export interface ArquivoFtp {
  nome: string;
  tamanho: number;
}