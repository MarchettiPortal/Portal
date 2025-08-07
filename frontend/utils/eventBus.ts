import mitt from 'mitt'
type Events = {
  'ftp-erro': string
  'clp-atualizado': void
  'arquivo-arrastado': File
  'limpar-arquivos-clp': void
}
const eventBus = mitt<Events>()

export default eventBus