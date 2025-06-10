<template>
  <div class="rounded-md border bg-white px-4 py-3 flex flex-wrap items-center gap-4 relative shadow-sm">
    <!-- Título -->
    <div class="flex items-center gap-2">
      <Icon icon="material-symbols:tv-displays-outline-rounded" class="text-gray-800 w-5 h-5" />
      <p class="text-gray-700 font-medium">Dispositivos</p>
    </div>

    <!-- Opções -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="option in options"
        :key="option.value"
        :disabled="isDisabled"
        @click="selectOption(option.value)"
        :class="[
          'px-3 py-1.5 text-sm rounded-md cursor-pointer border transition-all duration-200',
          selectedOption === option.value
            ? 'bg-red-100 border-red-300 text-red-700'
            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600',
          isDisabled && 'opacity-50 cursor-not-allowed'
        ]"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- Atualizar -->
    <button
      class="ml-auto flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm rounded-md border bg-white border-gray-300 hover:bg-gray-100 text-gray-700 disabled:opacity-50"
      :disabled="isDisabled"
      @click="onClickAtualizar"
    >
      <Icon icon="material-symbols:sync" class="w-5 h-5" />
      Atualizar CLP
    </button>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div class="bg-white rounded-md shadow-lg p-6 w-full max-w-sm text-center text-black">
        <div v-if="isLoading">
          <Icon icon="line-md:loading-loop" class="w-10 h-10 mx-auto mb-4 animate-spin text-red-600" />
          <p class="text-md font-medium">Atualizando CLP...</p>
        </div>
        <div v-else-if="showSuccess">
          <Icon icon="line-md:circle-to-confirm-circle-transition" class="w-12 h-12 text-green-600 mx-auto mb-2" />
          <p class="text-md font-semibold">CLP Selecionado com sucesso</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { config } from '~/config/global.config'
import { useAuthStore } from '~/stores/User/auth'
import { useClpStore } from '~/stores/CLP/useClpStore'
import { storeToRefs } from 'pinia'
import { useClpFtpStatus } from '~/composables/useClpFtpStatus'
import axios from 'axios'
import eventBus from '~/utils/eventBus'
import { Icon } from '@iconify/vue'

const emit = defineEmits<{
  (e: 'clp-updated', ip: string): void
  (e: 'clp-atualizado'): void
  (e: 'error', mensagem: string): void
}>()


const clpStore = useClpStore()
const { clpIpAtual } = storeToRefs(clpStore)
const { atualizarCLPAtual } = clpStore
const authStore = useAuthStore()
const userID = authStore.user?.name
const { status } = useClpFtpStatus()

const selectedOption = ref<string | null>(null)
const isLoading = ref(false)
const showModal = ref(false)
const showSuccess = ref(false)

const options = ref<{ label: string, value: string }[]>([])
// Buscar do Backend/Database os CLP's
async function carregarClps() {
  try {
    const { data } = await axios.get(`${config.API_BACKEND}/CLP/list`)
    options.value = data.map((clp: any) => ({
      label: clp.nome,
      value: clp.ip
    }))
  } catch {
   }
}
 

const isProcessingCLP = computed(() =>
  status.value.clp.reiniciando && status.value.clp.iniciadoPor !== userID
)

const isBlockedByFTP = computed(() =>
  status.value.ftp.enviando && status.value.ftp.iniciadoPor !== userID
)

const isDisabled = computed(() => isLoading.value || isProcessingCLP.value || isBlockedByFTP.value)

onMounted(async () => {
  atualizarCLPAtual()
  await carregarClps()
  selectedOption.value = clpIpAtual.value
  setInterval(() => atualizarCLPAtual(), 5000)
})

watch(clpIpAtual, (novoIp) => {
  selectedOption.value = novoIp
})

function selectOption(value: string) {
  selectedOption.value = value
}

async function onClickAtualizar() {
  if (!selectedOption.value) return emit('error', 'Nenhuma opção de CLP selecionada')
  if (selectedOption.value === clpIpAtual.value) return emit('error', 'CLP já está selecionado')
  if (isBlockedByFTP.value) return emit('error', `Envio de arquivo por ${status.value.ftp.iniciadoPor}`)

  showModal.value = true
  isLoading.value = true
  showSuccess.value = false

  // 👇 NOVO: limpar arquivos imediatamente
  eventBus.emit('limpar-arquivos-clp')

  try {
    await axios.post(`${config.API_BACKEND}/clp/set`, {
      ip: selectedOption.value,
      userID,
    })

    const checkUntilReady = setInterval(() => {
      if (!status.value.clp.reiniciando) {
        clearInterval(checkUntilReady)
        isLoading.value = false
        showSuccess.value = true
        emit('clp-updated', selectedOption.value!)
        emit('clp-atualizado')
        atualizarCLPAtual()

        setTimeout(() => {
          showModal.value = false
          showSuccess.value = false
        }, 1500)
      }
    }, 1000)
  } catch (error: any) {
    isLoading.value = false
    showModal.value = false
    emit('error', error?.response?.data?.error || 'Erro ao configurar CLP')
  }
}

</script>
