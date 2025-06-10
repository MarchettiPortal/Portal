export interface ClpOpcao {
  id: number
  label: string
  value: string
  sistema_clp: string
}

export interface ClpOpcaoPayload {
  label: string
  value: string
  sistema_clp?: string
}
