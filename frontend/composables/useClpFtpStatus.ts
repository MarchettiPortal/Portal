// composables/useClpFtpStatus.ts
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { config } from '~/config/global.config'

const status = ref({
  clp:   { reiniciando: false, iniciadoPor: null as string|null },
  ftp:   { enviando:    false, iniciadoPor: null as string|null },
})

let intervalId: ReturnType<typeof setInterval>|null = null

export function useClpFtpStatus() {
  const fetchStatus = async () => {
    try {
      const { data } = await axios.get(`${config.API_BACKEND}/ftp/status-global`)
      status.value = data
    } catch (err) {
      console.error('[useClpFtpStatus] erro ao buscar status:', err)
    }
  }

  onMounted(() => {
    fetchStatus()
    intervalId = setInterval(fetchStatus, 1500)
  })
  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })

  return { status }
}
