import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useClpGlobalStatus = defineStore('clpGlobalStatus', () => {
  const alterandoCLP = ref(false)
  const enviandoFTP = ref(false)

  const bloqueado = computed(() => alterandoCLP.value || enviandoFTP.value)

  return {
    alterandoCLP,
    enviandoFTP,
    bloqueado,
  }
})
