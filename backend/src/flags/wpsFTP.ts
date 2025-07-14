/**
 * Estado global de envio e reinicialização do WPS/FTP.
 *
 * Essas flags são utilizadas para evitar múltiplas operações concorrentes
 * sobre o serviço remoto.
 */

export let isReiniciando = false;
export let usuarioReiniciando: string | null = null;

export let isEnviandoArquivo = false;
export let usuarioEnviando: string | null = null;

/**
 * Define o estado de reinicialização do CLP/WPS.
 *
 * @param valor Valor booleano indicando se está reiniciando.
 * @param usuario Identificação do usuário que iniciou a operação.
 */
export function setReiniciando(valor: boolean, usuario: string | null) {
  isReiniciando = valor;
  usuarioReiniciando = usuario;
}

/**
 * Marca o envio de arquivo em andamento.
 *
 * @param valor Indica se há upload em execução.
 * @param usuario Usuário responsável pelo envio.
 */
export function setEnviandoArquivo(valor: boolean, usuario: string | null) {
  isEnviandoArquivo = valor;
  usuarioEnviando = usuario;
}
