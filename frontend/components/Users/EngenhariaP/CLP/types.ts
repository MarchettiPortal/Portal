export interface Arquivo {
  nomeArquivo: string
  tamanho: string
  tipo: string
  data: string
  usuario: string
  novo?: boolean
  fileReal?: File
}
