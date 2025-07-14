// stores/useClpStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { config } from '~/config/global.config'

interface Arquivo {
  nome: string
  tamanho: number
}

export const useClpStore = defineStore('clpStore', () => {
  const clpText = ref('Desconhecido')
  const clpIpAtual = ref('')
  const arquivosEmExecucao = ref<Arquivo[]>([])

  // 1) Busca status do CLP atual
  async function fetchStatus() {
      try {
        const { data } = await axios.get(`${config.API_BACKEND}/clp/status`)
        clpText.value    = data.label
        clpIpAtual.value = data.ip
      } catch {
        clpText.value = 'Erro ao atualizar status do CLP'
      }
    }

  // 2) Busca lista de arquivos no CLP via FTP
  async function fetchArquivosEmExecucao() {
    try {
      const { data } = await axios.get(`${config.API_BACKEND}/ftp/arquivo`, {
        params: { clp: clpText.value }
      })
      arquivosEmExecucao.value = data.dados || []
    } catch {
      arquivosEmExecucao.value = []
    }
  }

  // método único que faz ambas as buscas
  async function atualizarCLPAtual() {
    await fetchStatus()
    await fetchArquivosEmExecucao()
  }
  const isUnknown = computed(() => clpIpAtual.value === '')

  return {
    clpText,
    clpIpAtual,
    arquivosEmExecucao,
    isUnknown,
    fetchStatus,
    fetchArquivosEmExecucao,
    atualizarCLPAtual
  }
})
