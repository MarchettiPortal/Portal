// stores/useLogStore.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { config } from '~/config/global.config'

interface LogEntry {
  usuario: string
  nome_arquivo: string
  descricao: string
  data_envio: string | number
  tamanho: number
  clp: string
}

export const useLogStore = defineStore('clpLog', {
  state: () => ({
    logs: [] as LogEntry[],
  }),
  actions: {
    async fetchLogs() {
  try {
    const response = await fetch(`${config.API_BACKEND}/clp/logs`);
    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    this.logs = data;
  } catch (error: any) {
    console.error('Erro ao carregar logs:', error.message || error);
    throw new Error('Erro ao buscar logs');
  }
},

    addLog(log: LogEntry) {
      this.logs.unshift(log)
    }
  },
})
