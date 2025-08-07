import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue' 
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

  // ⚡️ novo estado para status do FTP
  const ftpStatus = ref<'idle' | 'iniciando' | 'concluído' | 'erro'>('idle')

  // 🔧 função para mudar o status
  function setFtpStatus(status: typeof ftpStatus.value) {
    ftpStatus.value = status
  }

  watch(ftpStatus, (novo) => {
    if (novo !== 'idle') {
      setTimeout(() => {
        ftpStatus.value = 'idle'
      }, 4000)
    }
  })
  
  async function fetchStatus() {
    try {
      const { data } = await axios.get(`${config.API_BACKEND}/clp/status`)
      clpText.value = data.label
      clpIpAtual.value = data.ip
    } catch {
      clpText.value = 'Erro ao atualizar status do CLP'
    }
  }

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
    atualizarCLPAtual,
    
    // adicionando FTP
    ftpStatus,
    setFtpStatus
  }
})
