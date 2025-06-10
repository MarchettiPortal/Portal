<template>
  <div class="rounded-sm shadow-md border bg-white relative" @dragover.prevent @drop="handleDrop">
    <!-- Header -->
    <div class="p-4 gap-4 flex items-center">
      <Icon icon="material-symbols:memory-rounded" class="text-black bg-gray-300 p-1 rounded-sm w-8 h-8" />
      <div class="flex flex-col">
        <h1 class="text-black text-lg">Em execução:</h1>
        <p class="text-gray-400 text-sm">{{ clpText }}</p>
      </div>
    </div>

    <!-- Arquivos principais enviados -->
    <div class="p-6">
      <div v-if="!arquivosEmExecucao.length" class="text-center text-gray-400">
        Nenhum arquivo enviado ainda.
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="(arquivo, index) in arquivosEmExecucao"
          :key="index"
          class="rounded-md p-4 bg-gray-50 border border-gray-200"
        >
          <Icon icon="material-symbols:description" class="w-10 h-10 text-black mb-2" />
          <p class="font-semibold text-sm text-black truncate">{{ arquivo.nomeArquivo }}</p>
          <ul class="text-xs text-gray-600 mt-2 space-y-0.5">
            <li><strong>Tamanho:</strong> {{ arquivo.tamanho }}</li>
            <li><strong>Tipo:</strong> {{ arquivo.tipo }}</li>
            <li><strong>Modificado:</strong> {{ arquivo.data }}</li>
            <li><strong>Usuário:</strong> {{ arquivo.usuario }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Lista de arquivos pendentes -->
    <div v-if="arquivosPendentes.length" class="border-t border-gray-200 px-6 pt-4 pb-6">
      <h3 class="text-sm font-semibold text-gray-600 mb-2">Arquivos pendentes:</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="(arq, index) in arquivosPendentes"
          :key="index"
          class="rounded-md p-3 bg-gray-100 border border-gray-300"
        >
          <div class="flex flex-col gap-2">
            <p class="text-sm font-medium text-black truncate">{{ arq.nomeArquivo }}</p>
            <p class="text-xs text-gray-500">{{ arq.tamanho }} • {{ arq.tipo }}</p>

            <div class="flex gap-2 mt-2">
              <button
                @click="selecionarParaEnvio(arq)"
                class="text-xs px-2 py-1 bg-red-600 cursor-pointer text-white rounded hover:bg-red-700 transition"
              >
                Selecionar
              </button>
              <button
                @click="removerArquivoPendente(arq.nomeArquivo)"
                class="text-xs px-2 py-1 bg-gray-300 cursor-pointer text-black rounded hover:bg-gray-400 transition"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex justify-center items-center backdrop-blur-sm z-50"
    >
      <div class="bg-white p-6 rounded-md shadow-md w-full max-w-md text-black">
        <h2 class="text-lg font-semibold mb-4">Enviar Descrição para o Log</h2>
        <textarea
          v-model="descricao"
          class="w-full border border-gray-300 rounded p-2 text-sm"
          rows="4"
          placeholder="Descreva o envio deste arquivo..."
        ></textarea>
        <div class="flex justify-end mt-4 gap-2">
          <button
            @click="confirmarDescricao"
            :disabled="!isDescricaoValida"
            class="bg-red-600 hover:bg-red-700 cursor-pointer text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
          <button
            @click="cancelar"
            class="bg-gray-500 cursor-pointer hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useClpStore } from '~/stores/CLP/useClpStore'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { config } from '~/config/global.config'
import { useLogStore } from '~/stores/CLP/CLPLogStore'
import { useAuthStore } from '~/stores/User/auth'
import eventBus from '~/utils/eventBus'
import { refreshNuxtData } from '#app'
import { useClpFtpStatus } from '~/composables/useClpFtpStatus'

interface Arquivo {
  nomeArquivo: string
  tamanho: string
  tipo: string
  data: string
  usuario: string
}

const { clpText } = storeToRefs(useClpStore())
const clpStore = useClpStore()
const logStore = useLogStore()
const authStore = useAuthStore()

const arquivosEmExecucao = ref<Arquivo[]>([])
const arquivosPendentes = ref<Arquivo[]>([])
const arquivoSelecionado = ref<Arquivo | null>(null)
const showModal = ref(false)
const descricao = ref('')

const isDescricaoValida = computed(() => descricao.value.trim().length > 0)

const { status } = useClpFtpStatus()

const clpReiniciando = computed(() => status.value.clp.reiniciando)

async function buscarArquivoEmExecucao() {
  try {
    const { data } = await axios.get(`${config.API_BACKEND}/clp/arquivo`)
    const arquivos = Array.isArray(data) ? data : [data]

    arquivosEmExecucao.value = arquivos
      .filter(a => a?.nome)
      .map(a => ({
        nomeArquivo: a.nome,
        tamanho: a.tamanho || '-',
        tipo: a.tipo || '-',
        data: a.data || new Date().toLocaleString(),
        usuario: a.usuario || 'CLP'
      }))
  } catch (err) {
    console.error('Erro ao buscar arquivos do CLP:', err)
    arquivosEmExecucao.value = []
  }
}

watch(clpReiniciando, async (isReiniciando, prevIsReiniciando) => {
  if (prevIsReiniciando && !isReiniciando) {
    console.log('CLP reiniciado, buscando arquivos...')
    await buscarArquivoEmExecucao()
  }
})

onMounted(async () => {
  if (!clpReiniciando.value) {
    await buscarArquivoEmExecucao()
  }
})

eventBus.on('limpar-arquivos-clp', () => {
  arquivosEmExecucao.value = [] // limpa imediatamente no frontend
})


eventBus.on('clp-atualizado', () => {
  if (!clpReiniciando.value) {
    buscarArquivoEmExecucao()
  }
})


eventBus.off('limpar-arquivos-clp', () => {
  arquivosEmExecucao.value = []
})


onBeforeUnmount(() => {
  eventBus.off('clp-atualizado', buscarArquivoEmExecucao)
})

watch(clpText, () => {
  if (!clpReiniciando.value) {
    buscarArquivoEmExecucao()
  }
})

function handleDrop(event: DragEvent) {
  const json = event.dataTransfer?.getData('application/json')
  if (json) {
    const fileData = JSON.parse(json)
    const novo: Arquivo = {
      nomeArquivo: fileData.nomeArquivo,
      tamanho: fileData.tamanho,
      tipo: fileData.tipo,
      data: fileData.data,
      usuario: authStore.user?.name || 'Desconhecido'
    }
    if (!arquivosPendentes.value.some(a => a.nomeArquivo === novo.nomeArquivo)) {
      arquivosPendentes.value.push(novo)
    }
  }
}

function selecionarParaEnvio(arq: Arquivo) {
  arquivoSelecionado.value = arq
  descricao.value = ''
  showModal.value = true
}

async function confirmarDescricao() {
  const desc = descricao.value.trim()
  if (!desc || !arquivoSelecionado.value) return

  const simulatedFile = new File(['simulado'], arquivoSelecionado.value.nomeArquivo, {
    type: arquivoSelecionado.value.tipo,
  })

  const formData = new FormData()
  formData.append('arquivo', simulatedFile)
  formData.append('descricao', desc)
  formData.append('usuario', authStore.user?.name || 'Desconhecido')
  formData.append('clp', clpStore.clpText)

  try {
    await axios.post(`${config.API_BACKEND}/clp/upload`, formData)

    logStore.addLog({
      nome_arquivo: arquivoSelecionado.value.nomeArquivo,
      descricao: desc,
      tamanho: parseFloat(arquivoSelecionado.value.tamanho),
      usuario: arquivoSelecionado.value.usuario,
      data_envio: new Date().toISOString(),
      clp: clpStore.clpText,
    })

    arquivosPendentes.value = arquivosPendentes.value.filter(
      f => f.nomeArquivo !== arquivoSelecionado.value?.nomeArquivo
    )

    await buscarArquivoEmExecucao()
    eventBus.emit('log-atualizado')
    await refreshNuxtData('ftp-logs')

    showModal.value = false
    descricao.value = ''
    arquivoSelecionado.value = null
  } catch (err) {
    alert('Erro ao enviar log.')
  }
}

function cancelar() {
  showModal.value = false
  descricao.value = ''
  arquivoSelecionado.value = null
}

function removerArquivoPendente(nome: string) {
  arquivosPendentes.value = arquivosPendentes.value.filter(a => a.nomeArquivo !== nome)
}
</script>
