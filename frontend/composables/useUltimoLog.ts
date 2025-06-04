import { ref } from 'vue'
import { config } from '~/config/global.config'

export interface LogCLP {
  nome_arquivo: string
  data_envio: string
  tamanho: number
  clp_selecionado: string
  usuario: string
  descricao: string
}

export function useUltimoLog() {
  const nomeArquivo = ref('')
  const data = ref('')
  const hora = ref('')
  const tamanho = ref('')
  const usuario = ref('')
  const descricao = ref('')

  async function buscarUltimoLog(clp: string) {
    if (!clp) return

    try {
      const response = await $fetch(`${config.API_BACKEND}/clp/ultimo-log`, {
        params: { clp }
      }) as LogCLP

      nomeArquivo.value = response.nome_arquivo || '-'
      tamanho.value = response.tamanho > 0 ? `${(response.tamanho / 1024).toFixed(2)} KB` : '-'
      usuario.value = response.usuario || '-'
      descricao.value = response.descricao || '-'

      const date = new Date(response.data_envio)
      if (!isNaN(date.getTime())) {
        data.value = date.toLocaleDateString('pt-BR')
        hora.value = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      } else {
        data.value = '-'
        hora.value = '-'
      }
    } catch (e) {
      nomeArquivo.value = 'Erro ao carregar'
      data.value = '-'
      hora.value = '-'
      tamanho.value = '-'
      usuario.value = '-'
      descricao.value = '-'
    }
  }

  return {
    nomeArquivo,
    data,
    hora,
    tamanho,
    usuario,
    descricao,
    buscarUltimoLog
  }
}
