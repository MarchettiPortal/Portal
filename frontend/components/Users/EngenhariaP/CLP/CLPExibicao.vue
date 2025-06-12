<template>
  <div
    class="rounded-sm shadow-md border bg-white relative"
    @dragover.prevent="onDragOver"
    @drop="handleDrop"
  >
    <!-- TOAST AMARELO: Upload em andamento -->
    <transition name="fade">
      <div
        v-if="showUploadEmAndamento"
        class="fixed top-20 right-4 w-72 bg-red-100 shadow-lg rounded-md ring-1 ring-red-400"
      >
        <div class="flex items-center px-3 py-2 space-x-2">
          <!-- Ícone de alerta -->
          <svg
            class="h-5 w-5 text-red-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-1.79 8-4V6c0-2.21-3.582-4-8-4s-8 1.79-8 4v10c0 2.21 3.582 4 8 4z"
            />
          </svg>
          <div class="flex-1">
            <p class="text-xs font-semibold text-gray-900">Atenção</p>
            <p class="text-xs text-gray-600 leading-snug">
              Já existe um envio em andamento. Aguarde até ser concluído.
            </p>
          </div>
        </div>
      </div>
    </transition>

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
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
        <div
          v-for="(arquivo, index) in arquivosEmExecucao"
          :key="index"
          class="rounded-md p-4 transition-all duration-300"
        >
          <Icon icon="material-symbols:description" class="w-10 h-10 text-black mb-2" />
          <!-- Edição inline -->
          <div class="flex flex-col min-h-[48px] justify-between">
            <div v-if="editandoArquivo === arquivo.nomeArquivo" class="flex w-full items-center">
              <input
                v-model="nomeEditado"
                @keyup.enter="confirmarRenomearInline(arquivo)"
                @blur="confirmarRenomearInline(arquivo)"
                class="w-full text-sm p-1 text-black rounded border border-gray-300 outline-none"
                autofocus
              />
              <span class="ml-1 text-sm font-semibold text-gray-600">.CSV</span>
            </div>
            <div v-else class="flex justify-between items-start gap-2">
              <div class="flex items-center gap-2 w-full">
                <p class="font-semibold text-sm text-black break-words">
                  {{ arquivo.nomeArquivo }}
                </p>
                <span
                  v-if="arquivo.novo"
                  class="text-xs text-white bg-green-600 px-1.5 py-0.5 rounded font-medium"
                >
                  Novo
                </span>
              </div>
              <button
                @click="ativarEdicao(arquivo)"
                title="Renomear arquivo"
                class="text-gray-500 hover:text-black shrink-0"
              >
                <Icon icon="material-symbols:edit" class="w-4 h-4 cursor-pointer" />
              </button>
            </div>
          </div>
          <ul class="text-xs text-gray-600 mt-2 space-y-0.5">
            <li><strong>Tamanho:</strong> {{ arquivo.tamanho }}</li>
            <li><strong>Tipo:</strong> {{ arquivo.tipo }}</li>
            <li><strong>Modificado:</strong> {{ arquivo.data }}</li>
            <li><strong>Usuário:</strong> {{ arquivo.usuario }}</li>
          </ul>
          <div class="flex gap-2 mt-3">
            <button
              @click="baixarArquivo(arquivo)"
              class="text-red-600 hover:text-red-800 cursor-pointer text-xs flex items-center gap-1"
            >
              <Icon icon="material-symbols:download" class="w-4 h-4" />
              Baixar
            </button>
            <button
              @click="abrirModalExcluir(arquivo)"
              class="text-red-600 hover:text-red-800 cursor-pointer text-xs flex items-center gap-1"
            >
              <Icon icon="material-symbols:delete-outline" class="w-4 h-4" />
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Arquivos pendentes -->
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
                class="text-red-600 hover:text-red-800 cursor-pointer text-xs flex items-center gap-1"
              >
                <Icon icon="material-symbols:delete-outline" class="w-4 h-4" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Área de drop -->
    <div
      v-if="!arquivosPendentes.length"
      class="mx-6 my-6 p-6 border-2 border-dashed border-gray-400 rounded-md flex flex-col items-center justify-center text-center text-gray-500 hover:border-red-500 hover:text-black transition"
    >
      <Icon icon="material-symbols:upload" class="w-10 h-10 mb-2" />
      <p class="text-sm font-medium">Arraste e solte arquivos aqui para enviar</p>
    </div>

    <!-- Modais -->
    <ModalDescription
      v-model:show="showModal"
      v-model:descricao="descricao"
      :disabled="uploadLocked"
      @confirm="confirmarDescricao"
    />
    <ModalLoadingFile v-model:show="isUploading" />
    <ModalSuccessFile v-model:show="isSuccess" />
    <ModalDelete
      v-model:show="modalExcluir"
      :arquivoName="arquivoSelecionado?.nomeArquivo || ''"
      @confirm="confirmarExcluir"
    />
  </div>
</template>
 
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Icon } from '@iconify/vue'
import axios from 'axios'
import { useNuxtApp } from '#app'
import type { Socket } from 'socket.io-client'
import { config } from '~/config/global.config'
import { storeToRefs } from 'pinia'
import { useClpStore } from '~/stores/CLP/useClpStore'
import { useLogStore } from '~/stores/CLP/CLPLogStore'
import { useAuthStore } from '~/stores/User/auth'
import { useClpFtpStatus } from '~/composables/useClpFtpStatus'

import ModalDelete from '~/components/Models/CLPModals/ModalDelete.vue'
import ModalDescription from '~/components/Models/CLPModals/ModalDescription.vue'
import ModalSuccessFile from '~/components/Models/CLPModals/ModalSuccessFile.vue'
import ModalLoadingFile from '~/components/Models/CLPModals/ModalLoadingFile.vue'

interface Arquivo {
  nomeArquivo: string
  tamanho: string
  tipo: string
  data: string
  usuario: string
  novo?: boolean
  fileReal?: File
}
 
// Stores & Status
const clpStore       = useClpStore()
const logStore       = useLogStore()
const authStore      = useAuthStore()
const { clpText }    = storeToRefs(clpStore)
 
// Polling de CLP/FTP
const { status }     = useClpFtpStatus()
const clpReiniciando = computed(() => status.value.clp.reiniciando)
const uploadLocked   = computed(() => status.value.ftp.enviando)
 
// Socket.IO
const { $socket }    = useNuxtApp()
const socket         = $socket as Socket
 
// Reativos do componente
const arquivosEmExecucao   = ref<Arquivo[]>([])
const arquivosPendentes    = ref<Arquivo[]>([])
const arquivoSelecionado   = ref<Arquivo | null>(null)
const showUploadEmAndamento= ref(false)
const errorToast           = ref('')
const descricao            = ref('')
const editandoArquivo      = ref<string | null>(null)
const nomeEditado          = ref('')
const showModal            = ref(false)
const modalExcluir         = ref(false)
const isUploading          = ref(false)
const isSuccess            = ref(false)
const arquivoArrastado     = ref<File | null>(null)
 
// Helpers
const formatarTamanho = (bytes: number) =>
  bytes < 1024**2
    ? `${(bytes/1024).toFixed(1)} KB`
    : `${(bytes/1024**2).toFixed(1)} MB`
const inferirTipo = (nome: string) => {
  const ext = nome.split('.').pop()?.toLowerCase()
  return ({ csv: 'CSV', txt: 'Texto', clp: 'CLP' }[ext!] || 'Desconhecido')
}
const showError = (msg: string) => {
  errorToast.value = msg
  setTimeout(() => errorToast.value = '', 3000)
}
 
// Busca arquivos no CLP
async function buscarArquivoEmExecucao() {
  if (clpReiniciando.value) {
    arquivosEmExecucao.value = []
    return
  }
  try {
    const { data } = await axios.get(`${config.API_BACKEND}/clp/arquivo`, {
      params: { clp: clpText.value }
    })
    arquivosEmExecucao.value = (data.dados || [])
      .filter((a: any) => a.nome)
      .map((a: any) => ({
        nomeArquivo: a.nome,
        tamanho: formatarTamanho(a.tamanho),
        tipo: inferirTipo(a.nome),
        data: new Date().toLocaleString(),
        usuario: 'CLP'
      }))
  } catch {
    arquivosEmExecucao.value = []
  }
}
 
// Download
async function baixarArquivo(arquivo: Arquivo) {
  try {
    const resp = await axios.get(`${config.API_BACKEND}/clp/arquivo/download`, {
      params: { nome: arquivo.nomeArquivo, clp: clpText.value },
      responseType: 'blob'
    })
    const url = URL.createObjectURL(new Blob([resp.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', arquivo.nomeArquivo)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch {
    showError('Erro ao baixar arquivo.')
  }
}
 
// Edição inline
function ativarEdicao(arquivo: Arquivo) {
  editandoArquivo.value = arquivo.nomeArquivo
  nomeEditado.value = arquivo.nomeArquivo.replace(/\.csv$/i, '')
}
async function confirmarRenomearInline(arquivo: Arquivo) {
  const nomeFinal = `${nomeEditado.value.trim()}.CSV`
  if (!nomeEditado.value.trim() || nomeFinal === arquivo.nomeArquivo) {
    editandoArquivo.value = null
    return
  }
  try {
    await axios.patch(`${config.API_BACKEND}/clp/arquivo/renomear`, {
      antigoNome: arquivo.nomeArquivo,
      novoNome: nomeFinal
    })
    await buscarArquivoEmExecucao()
  } catch {
    showError('Erro ao renomear arquivo.')
  } finally {
    editandoArquivo.value = null
  }
}
 
// Seleção, envio, exclusão e drop (sem alterações no core)
 
function onDragOver(e: DragEvent) {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'copy'
}
function handleDrop() {
  const file = arquivoArrastado.value
  if (file && !arquivosPendentes.value.some(a => a.nomeArquivo === file.name)) {
    arquivosPendentes.value.push({
      nomeArquivo: file.name,
      tamanho: formatarTamanho(file.size),
      tipo: inferirTipo(file.name),
      data: new Date().toLocaleString(),
      usuario: authStore.user?.name || 'Desconhecido',
      fileReal: file
    })
  }
  arquivoArrastado.value = null
}
 
onMounted(() => {
  // 1) Inicializa status e arquivos
  clpStore.atualizarCLPAtual?.()
  buscarArquivoEmExecucao()
  // 2) Conecta e ingressa na sala do CLP
  socket.connect()
  socket.emit('join-clp', { clp: clpText.value })
  // 3) Liga listeners de push
  socket.on('ftp-upload-completo', () => buscarArquivoEmExecucao())
  socket.on('arquivo-renomeado',   () => buscarArquivoEmExecucao())
  socket.on('arquivo-excluido',    () => buscarArquivoEmExecucao())
  socket.on('clp-trocado',         () => clpStore.atualizarCLPAtual?.())
})
 
onBeforeUnmount(() => {
  socket.off('ftp-upload-completo')
  socket.off('arquivo-renomeado')
  socket.off('arquivo-excluido')
  socket.off('clp-trocado')
})
 
watch(clpText, () => {
  clpStore.atualizarCLPAtual?.()
  buscarArquivoEmExecucao()
})
</script>
 
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
