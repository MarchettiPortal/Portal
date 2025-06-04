// stores/chamados.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { config } from '../config/global.config'


export const useChamadosStore = defineStore('chamados', () => {
  const chamadoSelecionado = ref<any | null>(null)

  const chamados = ref<any[]>([])
  const loading  = ref(false)
  const error    = ref('')

  const fetchChamados = async () => {
    loading.value = true
    error.value   = ''
    try {
      const res = await axios.get(`${config.API_MILVUS_BACKEND}/chamados`)
      chamados.value = res.data
    } catch (err: any) {
      error.value = 'Erro ao buscar chamados.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

const selecionarChamado = (codigo: string) => {
  chamadoSelecionado.value = chamados.value.find(c => c.codigo === codigo) || null
}
  return {     
    chamados,
    chamadoSelecionado,
    loading,
    error,
    fetchChamados,
    selecionarChamado }
})
