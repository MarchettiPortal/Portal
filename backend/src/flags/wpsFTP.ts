// src/state/clpState.ts

export let isReiniciando = false;
export let usuarioReiniciando: string | null = null;

export let isEnviandoArquivo = false;
export let usuarioEnviando: string | null = null;

export function setReiniciando(valor: boolean, usuario: string | null) {
  isReiniciando = valor;
  usuarioReiniciando = usuario;
}

export function setEnviandoArquivo(valor: boolean, usuario: string | null) {
  isEnviandoArquivo = valor;
  usuarioEnviando = usuario;
}
