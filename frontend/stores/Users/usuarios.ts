import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { config } from '../../config/global.config'

export const useUsuariosStore = defineStore('usuarios', () => {
  const usuarios = ref<any[]>([])
  const loading = ref(false)
  const error = ref('')

  const fetchUsuarios = async () => {
    loading.value = true
    error.value = ''
    try {
      const res = await axios.get(`${config.API_BACKEND}/graph/users`)
      usuarios.value = res.data
    } catch (err: any) {
      error.value = 'Erro ao buscar usuários.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  return { usuarios, loading, error, fetchUsuarios }
})