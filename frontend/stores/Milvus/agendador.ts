// stores/agendador.ts
import { defineStore } from 'pinia'
import axios from 'axios'
import { config } from '../../config/global.config'

export const useAgendadorStore = defineStore('agendador', {
  state: () => ({
    ativo: false,
    loading: false
  }),
  actions: {
    async fetchStatus() {
      this.loading = true
      try {
        const { data } = await axios.get(`${config.API_MILVUS_BACKEND}/status`)
        this.ativo = data.ativo
      } finally {
        this.loading = false
      }
    },
    async toggleStatus(novoStatus: boolean) {
      this.loading = true
      try {
        await axios.post(`${config.API_MILVUS_BACKEND}/status`, { ativo: novoStatus })
        this.ativo = novoStatus
      } finally {
        this.loading = false
      }
    }
  }
})
