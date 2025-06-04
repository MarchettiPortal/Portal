<template>
  <div class="relative p-4 text-black bg-gray-200 min-h-[300px]">
    <!-- Texto de status -->
    <p class="mb-4 text-lg font-semibold">
      Dispositivo Conectado: <br> {{ clpText }}
    </p>

    <!-- Opções -->
    <div class="space-y-2 w-52">
      <label
        v-for="option in options"
        :key="option.value"
        class="flex items-center space-x-2 cursor-pointer"
      >
        <input
          type="radio"
          v-model="selectedOption"
          :value="option.value"
          class="hidden"
        />
        <span
          class="radio-button"
          :class="{ checked: selectedOption === option.value }"
        />
        <span>{{ option.label }}</span>
      </label>
    </div>

    <!-- Botão -->
    <button
      @click="onClickAtualizar"
      :disabled="isBlockedByFTP || isProcessingCLP"
      class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ isLoading ? 'Atualizando...' : 'Atualizar CLP' }}
    </button>
    <template v-if="isProcessingCLP">
      <p class="text-red-600">
        Atualização do CLP em andamento por {{ status.clp.iniciadoPor }}
      </p>
    </template>
    <template v-else-if="isBlockedByFTP">
      <p class="text-red-600">
        Envio de FTP em andamento por {{ status.ftp.iniciadoPor }}
      </p>
    </template>
    <!-- Overlay de carregamento -->
    <div
      v-if="isLoading"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <img src="/gifs/loading.gif" alt="Carregando..." class="w-16 h-16" />
    </div>

    <!-- Modal de status -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded shadow-md max-w-xs text-center">
        <p class="text-lg font-semibold mb-4">{{ modalMessage }}</p>
        <button
          @click="showModal = false"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { config } from '~/config/global.config'
import { useAuthStore } from '@/stores/auth' // Store para buscar info do usser (nome)
import { useClpStore } from '~/stores/CLP/useClpStore' // Store para buscar nome do CLP
import { storeToRefs } from 'pinia'
import { useClpFtpStatus } from '~/composables/useClpFtpStatus'

// Const das STORES/Pinia
const { atualizarCLPAtual } = useClpStore() // Store CLP: Função que busca os dados
const clpStore = useClpStore() // Store CLP: Variável para auxílio na próxima
const { clpText, clpIpAtual } = storeToRefs(clpStore) // Store CLP: Busca o IP e o Nome dos CLP's que são buscados na função da store
const authStore = useAuthStore() // Buscar nome do Usuário

// Const de auxílio no código
const userID = authStore.user?.name // Buscar nome do Usuário
const selectedOption = ref<string | null>(null) // Opções de CLP
const isLoading = ref(false) // Polling usa para validar se ainda está reiniciando WPS
const showModal = ref(false) // Modal de mensagens
const modalMessage = ref('') // Mensagens do modal
const { status } = useClpFtpStatus()

const isProcessingCLP = computed(() =>
  status.value.clp.reiniciando && 
  status.value.clp.iniciadoPor !== authStore.user?.name
)
// Validar se alguém já está editando o CLP ou Reiniciando o WPS
const isBlockedByFTP = computed(() =>
  status.value.ftp.enviando &&
  status.value.ftp.iniciadoPor !== authStore.user?.name
)

// Opções de CLP (mudar para banco de dados futuramente)
const options = [
  { label: 'CLP Arqueadeira', value: '192.168.1.168' },
  { label: 'CLP Laminador', value: '192.168.1.164' },
  { label: 'CLP Buchas', value: '192.168.1.130' },
]
// Tipagem
interface BackendResponse {
  success?: boolean
  message?: string
  error?: string
}

// Função que faz validações e inicia o reinício 
function onClickAtualizar() {
  
  // Validação de CLP escolhido ser o mesmo que já está setado
  if (selectedOption.value && selectedOption.value === clpIpAtual.value) {
    modalMessage.value = 'CLP escolhido já está selecionado'
    showModal.value = true
    return
  }
  // Validação de bloqueio por alguém enviando FTP caso o Polling falhe e não bloqueie o botão
  if (isBlockedByFTP.value) {
    alert(`Envio de arquivo em andamento por ${status.value.ftp.iniciadoPor}`)
    return
  }
  // Chamando função de reinício (só é chamado caso não tenho bloqueio)
  updateCLPText();
}

// Buscando valores
onMounted(async () => {
  atualizarCLPAtual() 
  setInterval(() => {
    atualizarCLPAtual() 
  },5000);
});

// Inicia o processo de atualização do CLP e reinicia o WPS
async function updateCLPText() {
  if (!selectedOption.value) {
    alert('Nenhuma opção de CLP selecionada')
    return
  }
  // Setar opções para loading e travamento da tela
  isLoading.value = true
  showModal.value = false

  // Inicio processo
  try {
    await axios.post<BackendResponse>(`${config.API_BACKEND}/clp/set`, {
      ip: selectedOption.value,
      userID,
    })


    // Validando se o Loading finalizou ou não
    const checkUntilReady = setInterval(() => {
      if (!status.value.clp.reiniciando) {
        clearInterval(checkUntilReady)
        modalMessage.value = 'CLP Selecionado com sucesso'
        showModal.value = true
        isLoading.value = false
        atualizarCLPAtual() 
      }
    }, 1000)

  } catch (error: any) {
    modalMessage.value = error?.response?.data?.error || 'Erro ao configurar CLP'
    showModal.value = true
    isLoading.value = false
  }
}



</script>

<style scoped>
.radio-button {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #e11d48;
  background-color: white;
  position: relative;
  transition: all 0.3s ease;
}

.radio-button.checked {
  background-color: #e11d48;
  border-color: #e11d48;
}

.radio-button.checked::before {
  content: '';
  display: block;
  width: 50%;
  height: 50%;
  border-radius: 50%;
  background-color: white;
  position: absolute;
  top: 25%;
  left: 25%;
}
</style>
