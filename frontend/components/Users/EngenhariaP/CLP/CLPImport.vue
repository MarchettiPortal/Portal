<template>
  <div class="flex text-black flex-col items-end space-y-4 w-full">
    <div class="bg-gray-200 p-4 rounded-xs w-full max-w-md">
      <p><strong>Nome do arquivo:</strong> {{ selectedFile?.name || 'Nenhum arquivo selecionado' }}</p>
      <p><strong>Tamanho:</strong> {{ formatSize(selectedFile?.size || 0) }}</p>
      <div class="mt-4 flex flex-col sm:flex-row gap-4 sm:gap-8 items-start">
        <button :disabled="isBlockedByFTP || isProcessingCLP" @click="openLogModal"
          class="bg-red-600 hover:bg-red-700 text-white transition duration-300 font-medium p-2 rounded-xs shadow disabled:opacity-50 disabled:cursor-not-allowed">
          Enviar para CLP
        </button>
        <label for="fileInput" :class="[
          'transition duration-300 font-medium p-2 rounded-xs shadow',
          isBlockedByFTP || isProcessingCLP
            ? 'bg-red-600 hover:bg-red-700 text-white opacity-50 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
        ]">
          Escolher arquivo de receitas
        </label>
        <p v-if="isBlockedByFTP || isProcessingCLP" class="text-red-600">
          <template v-if="isProcessingCLP">
            Atualização do CLP em andamento por {{ status.clp.iniciadoPor }}
          </template>
          <template v-else-if="isBlockedByFTP">
            Envio de FTP em andamento por {{ status.ftp.iniciadoPor }}
          </template>
        </p>

        <input id="fileInput" type="file" accept=".csv" class="hidden" @change="handleFileChange"
          :disabled="isBlockedByFTP || isProcessingCLP" />
      </div>
    </div>
  </div>

  <!-- Modal de Descrição -->
  <div v-if="isModalOpen"
    class="fixed inset-0 bg-black/50 flex justify-center items-center backdrop-blur-sm animate-fade-in">
    <div class="bg-white p-6 text-black rounded-xs shadow-lg w-1/3">
      <h2 class="text-xl mb-4">Enviar Descrição para o Log</h2>
      
        <UInput
          variant="none"
          class="mb-4 w-full"
          size="xl"
          :ui="{
             base: 'bg-white-400 text-black border rounded-xs',
          }"
        />
      
      <div class="flex justify-end space-x-4">
        <button @click="submitLog" :disabled="isBlockedByFTP || isProcessingCLP || sending"
          class="bg-red-600 hover:bg-red-700 text-white transition duration-300 font-medium p-2 rounded-sm shadow disabled:opacity-50 disabled:cursor-not-allowed">
          Enviar
        </button>
        <button @click="closeLogModal" class="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded">
          Cancelar
        </button>
      </div>
    </div>
  </div>


  <!-- Modal de Progresso (somente FTP) -->
  <div v-if="showProgressModal" class="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
    <div class="bg-white p-6 rounded shadow-lg w-1/3">
      <h2 class="text-xl mb-4">Enviando arquivo para CLP...</h2>
      <div class="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
        <div class="bg-green-500 h-4 rounded-full transition-all duration-200" :style="{ width: progresso + '%' }">
        </div>
      </div>
      <p>{{ progresso.toFixed(1) }}%</p>
    </div>
  </div>

  <!-- Modal de Resultado -->
  <div v-if="showResultModal" class="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white p-6 rounded shadow-lg w-1/3">
      <h2 class="text-xl mb-4">Resultado do Envio</h2>
      <p class="mb-6">{{ resultMessage }}</p>
      <div class="flex justify-end">
        <button @click="closeResultModal"
          class="bg-red-600 hover:bg-red-700 text-white font-medium p-2 rounded-sm shadow">
          OK
        </button>
        <button @click="submitLog"
          class="bg-red-600 hover:bg-red-700 text-white transition duration-300 font-medium p-2 rounded-xs shadow">Enviar</button>
        <button @click="closeLogModal" class="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import axios from 'axios'
import { useAuthStore } from '~/stores/User/auth'
import { useLogStore } from '~/stores/CLP/CLPLogStore'
import { config } from '~/config/global.config'
import { io } from 'socket.io-client'
import { useClpStore } from '~/stores/CLP/useClpStore'
import eventBus from '~/utils/eventBus'
import { useClpFtpStatus } from '~/composables/useClpFtpStatus'

const { status } = useClpFtpStatus();
// Const para SOTRE/Pinia
const authStore = useAuthStore()
const { addLog } = useLogStore()

// Const para auxílio no código
const showResultModal = ref(false)
const resultMessage = ref('')
const ClpStore = useClpStore()
const socket = io(config.URL_BACKEND)
const selectedFile = ref<File | null>(null)
const isModalOpen = ref(false)
const showProgressModal = ref(false)
const description = ref('')
const progresso = ref(0)
const sending = ref(false)

// Validar se alguém já está atualizando CLP
const isProcessingCLP = computed(() =>
  status.value.clp.reiniciando &&
  status.value.clp.iniciadoPor !== authStore.user?.name
)
// Validar se alguém já está enviando FTP
const isBlockedByFTP = computed(() =>
  status.value.ftp.enviando &&
  status.value.ftp.iniciadoPor !== authStore.user?.name
)



let socketId: string | undefined
socket.on('connect', () => {
  socketId = socket.id
})

function closeResultModal() {
  showResultModal.value = false
}

function resetAll() {
  selectedFile.value = null
  description.value = ''
  progresso.value = 0
  sending.value = false
  isModalOpen.value = false
  showProgressModal.value = false
}

onMounted(resetAll)
onBeforeUnmount(resetAll)

watch([isBlockedByFTP, isProcessingCLP], ([ftpBloqueado, clpBloqueado]) => {
  if (ftpBloqueado || clpBloqueado) {
    isModalOpen.value = false
  }
})

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

function openLogModal() {

  if (!selectedFile.value) {
    alert('Selecione um arquivo antes de enviar.')
    return
  }
  isModalOpen.value = true
}

function closeLogModal() {
  isModalOpen.value = false
  description.value = ''
}

async function submitLog() {
  // Validação de bloqueio por alguém enviando FTP
  if (isBlockedByFTP.value) {
    alert(`Envio de arquivo em andamento por ${status.value.ftp.iniciadoPor}`)
    return
  }

  if (!description.value.trim()) {
    alert('Por favor, insira uma descrição.')
    return
  }
  if (!selectedFile.value) {
    alert('Nenhum arquivo selecionado para envio.')
    return
  }


  // Prepara modal de progresso (FTP apenas)
  progresso.value = 0
  isModalOpen.value = false
  showProgressModal.value = false
  sending.value = true
  await nextTick()
  showProgressModal.value = true

  const formData = new FormData()
  formData.append('arquivo', selectedFile.value)
  formData.append('descricao', description.value)
  formData.append('usuario', authStore.user?.name || 'Desconhecido')
  formData.append('clp', ClpStore.clpText)

  try {
    await axios.post(
      `${config.API_BACKEND}/clp/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-socket-id': socketId,
        },
        // REMOVIDO: onUploadProgress
      }
    )
    eventBus.emit('log-atualizado')

    addLog({
      nome_arquivo: selectedFile.value.name,
      descricao: description.value,
      tamanho: selectedFile.value.size,
      usuario: authStore.user?.name || 'Desconhecido',
      data_envio: new Date().toISOString(),
      clp: ClpStore.clpText,
    })
    resultMessage.value = 'Arquivo enviado com sucesso!'
    showResultModal.value = true

    resetAll()
  } catch (error: any) {
    resultMessage.value = 'Falha ao enviar arquivo: ' + (error.response?.data?.detalhes || error.message)
    showResultModal.value = true

    setTimeout(() => {
      showProgressModal.value = false
      sending.value = false
    }, 1000)
  }
}

socket.on('ftp-progress', (percent: number) => {
  progresso.value = percent
})

socket.on('ftp-finished', () => {
  setTimeout(() => {
    showProgressModal.value = false
    sending.value = false
    resetAll()
    // ✅ Emite evento global
    eventBus.emit('log-atualizado')

  }, 500)
})


function formatSize(size: number) {
  return `${(size / 1024).toFixed(2)} KB`
}

onBeforeUnmount(() => {
  socket.off('ftp-progress')
  socket.disconnect()
})


</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>