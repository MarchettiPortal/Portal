// stores/useClpStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { config } from '~/config/global.config'

export const useClpStore = defineStore('clpStore', () => {
  const clpText = ref('Desconhecido')
  const clpIpAtual = ref('')

async function atualizarCLPAtual() {
  try {
    const { data } = await axios.get(`${config.API_BACKEND}/clp/status`)
    clpText.value = `${data.label}`
    clpIpAtual.value = data.ip
  } catch {
    clpText.value = 'Erro ao atualizar status do CLP'
  }
}

  return {
    clpText,
    clpIpAtual,
    atualizarCLPAtual
  }
})
