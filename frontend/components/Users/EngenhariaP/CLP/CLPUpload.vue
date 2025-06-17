<!-- CLPUpload.vue -->
<template>
  <div
    class="rounded-sm shadow-md border bg-white relative"
    @dragover.prevent="onDragOver"
    @drop="handleDrop"
  >
    <!-- TOAST AMARELO: Upload em andamento -->
    <CLPToast :show="showUploadEmAndamento" />

    <!-- TOAST DE ERRO -->
    <div
      v-if="errorToast"
      class="absolute top-4 right-4 bg-red-100 text-red-800 px-4 py-2 rounded shadow"
    >
      {{ errorToast }}
    </div>

    <!-- Header -->
    <CLPHeader :clp-text="clpText" />

    <!-- Arquivos principais enviados -->
    <CLPExecucao
      :arquivos="arquivosEmExecucao"
      :editando-arquivo="editandoArquivo"
      v-model:nome-editado="nomeEditado"
      @ativar-edicao="ativarEdicao"
      @confirmar-renomear-inline="confirmarRenomearInline"
      @abrir-modal-excluir="abrirModalExcluir"
    />

    <!-- Arquivos pendentes -->
    <CLPPendentes
      :arquivos-pendentes="arquivosPendentes"
      :upload-locked="uploadLocked"
      @selecionar="selecionarParaEnvio"
      @remover="removerArquivoPendente"
    />

    <!-- Área de drop -->
    <CLPDropArea v-if="!arquivosPendentes.length" />

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
import axios from 'axios'
import eventBus from '~/utils/eventBus'
import { config } from '~/config/global.config'
import { storeToRefs } from 'pinia'
import { useClpStore } from '~/stores/CLP/useClpStore'
import { useLogStore } from '~/stores/CLP/CLPLogStore'
import { useAuthStore } from '~/stores/User/auth'
import { useClpFtpStatus } from '~/composables/useClpFtpStatus'

import CLPToast from '~/components/Users/EngenhariaP/CLP/CLPExibicao/CLPToast.vue'
import CLPHeader from '~/components/Users/EngenhariaP/CLP/CLPExibicao/CLPHeader.vue'
import CLPExecucao from '~/components/Users/EngenhariaP/CLP/CLPExibicao/CLPExecucao.vue'
import CLPPendentes from '~/components/Users/EngenhariaP/CLP/CLPExibicao/CLPPendentes.vue'
import CLPDropArea from '~/components/Users/EngenhariaP/CLP/CLPExibicao/CLPDropArea.vue'

import ModalDelete from '~/components/Models/CLPModals/ModalDelete.vue'
import ModalDescription from '~/components/Models/CLPModals/ModalDescription.vue'
import ModalSuccessFile from '~/components/Models/CLPModals/ModalSuccessFile.vue'
import ModalLoadingFile from '~/components/Models/CLPModals/ModalLoadingFile.vue'

import type { Arquivo } from './types'

// Stores e Status
const clpStore = useClpStore()
const logStore = useLogStore()
const authStore = useAuthStore()
const { clpText } = storeToRefs(clpStore)
const { status } = useClpFtpStatus()
const clpReiniciando = computed(() => status.value.clp.reiniciando)

// Armazenar o nome do último arquivo enviado
const lastUploadedArquivo = ref<string | null>(null)

// Reativos
const arquivosEmExecucao = ref<Arquivo[]>([])
const arquivosPendentes = ref<Arquivo[]>([])
const arquivoSelecionado = ref<Arquivo | null>(null)

const uploadLocked = ref(false)
const showUploadEmAndamento = ref(false)
const errorToast = ref('')

const descricao = ref('')
const editandoArquivo = ref<string | null>(null)
const nomeEditado = ref('')

const showModal = ref(false)
const modalExcluir = ref(false)
const isUploading = ref(false)
const isSuccess = ref(false)
const arquivoArrastado = ref<File | null>(null)


// Helpers gerais
const showError = (msg: string) => {
  errorToast.value = msg
  setTimeout(() => { errorToast.value = '' }, 3000)
}

const fetchUploadStatus = async () => {
  try {
    const { data } = await axios.get(`${config.API_BACKEND}/ftp/status-global`)
    uploadLocked.value = data.ftp.enviando
  } catch (e) {
    console.warn('Falha ao buscar status de upload', e)
  }
}

// Formatação de arquivos
const formatarTamanho = (bytes: number) =>
  bytes < 1024 ** 2
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / 1024 ** 2).toFixed(1)} MB`

const inferirTipo = (nome: string) => {
  const ext = nome.split('.').pop()?.toLowerCase()
  return ({ csv: 'CSV', txt: 'Texto', clp: 'CLP' }[ext!] || 'Desconhecido')
}

// remove arquivos pendentes
const removerArquivoPendente = (nome: string) => {
  arquivosPendentes.value = arquivosPendentes.value.filter(a => a.nomeArquivo !== nome)
}

// Drag-Drop
const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'copy'
}

// Busca inicial de arquivos e marca “novo”
const buscarArquivoEmExecucao = async () => {
  if (clpReiniciando.value) {
    arquivosEmExecucao.value = []
    return
  }

  try {
    const { data } = await axios.get(`${config.API_BACKEND}/ftp/arquivo`, {
      params: { clp: clpStore.clpText }
    })

    arquivosEmExecucao.value = (data?.dados || [])
      .filter((a: any) => a.nome)
      .map((a: any) => ({
        nomeArquivo: a.nome,
        tamanho: formatarTamanho(a.tamanho),
        tipo: inferirTipo(a.nome),
        data: new Date().toLocaleString(),
        usuario: 'CLP',
        novo: lastUploadedArquivo.value === a.nome
      }))
  } catch {
    arquivosEmExecucao.value = []
  }
}

// ativarEdicao mantém apenas o nome sem extensão
const ativarEdicao = (arquivo: Arquivo) => {
  editandoArquivo.value = arquivo.nomeArquivo
  nomeEditado.value = arquivo.nomeArquivo.replace(/\.[^.]+$/, '')
}

// confirmação de renomeação inline (com extensão reaplicada)
const confirmarRenomearInline = async (arquivo: Arquivo) => {
  const trimmed = nomeEditado.value.trim()
  if (!trimmed) {
    editandoArquivo.value = null
    return
  }

  // separar base e extensão
  const parts = arquivo.nomeArquivo.split('.')
  const base = parts.slice(0, -1).join('.') || parts[0]
  const ext  = parts.length > 1 ? `.${parts[parts.length - 1]}` : ''

  const novoNomeCompleto = `${trimmed}${ext}`

  if (novoNomeCompleto === arquivo.nomeArquivo) {
    editandoArquivo.value = null
    return
  }

  try {
    await axios.patch(`${config.API_BACKEND}/ftp/arquivo/renomear`, {
      antigoNome: arquivo.nomeArquivo,
      novoNome: novoNomeCompleto
    })
    await buscarArquivoEmExecucao()
  } catch {
    showError('Erro ao renomear arquivo.')
  } finally {
    editandoArquivo.value = null
  }
}

// Gerenciamento de arquivos pendentes
const selecionarParaEnvio = (arq: Arquivo) => {
  if (uploadLocked.value) {
    showUploadEmAndamento.value = true
    setTimeout(() => (showUploadEmAndamento.value = false), 3000)
    return
  }
  arquivoSelecionado.value = arq
  descricao.value = ''
  showModal.value = true
}

// Abrir modal excluir
const abrirModalExcluir = (arquivo: Arquivo) => {
  arquivoSelecionado.value = arquivo
  modalExcluir.value = true
}

// Envio do arquivo
const confirmarDescricao = async () => {
  if (!descricao.value.trim() || !arquivoSelecionado.value) return

  const fileReal = arquivosPendentes.value.find(
    f => f.nomeArquivo === arquivoSelecionado.value!.nomeArquivo
  )?.fileReal

  if (!fileReal) {
    showError('Arquivo original não encontrado.')
    return
  }

  showModal.value = false
  isUploading.value = true

  const formData = new FormData()
  formData.append('arquivo', fileReal)
  formData.append('descricao', descricao.value.trim())
  formData.append('usuario', authStore.user?.name || 'Desconhecido')
  formData.append('clp', clpStore.clpText)

  try {
    await axios.post(`${config.API_BACKEND}/ftp/upload`, formData)
    lastUploadedArquivo.value = arquivoSelecionado.value.nomeArquivo
    arquivosPendentes.value = arquivosPendentes.value.filter(
      f => f.nomeArquivo !== arquivoSelecionado.value!.nomeArquivo
    )
    await buscarArquivoEmExecucao()
    isSuccess.value = true
    setTimeout(() => (isSuccess.value = false), 1500)
  } catch (error: any) {
    if (error.response?.status === 423) {
      showUploadEmAndamento.value = true
      setTimeout(() => (showUploadEmAndamento.value = false), 3000)
    } else {
      showError('Erro ao enviar arquivo.')
    }
  } finally {
    isUploading.value = false
    arquivoSelecionado.value = null
  }
}

// Excluir arquivo
const confirmarExcluir = async () => {
  if (!arquivoSelecionado.value) return
  try {
    await axios.delete(
      `${config.API_BACKEND}/ftp/arquivo/${encodeURIComponent(
        arquivoSelecionado.value.nomeArquivo
      )}`
    )
    await buscarArquivoEmExecucao()
  } catch {
    showError('Erro ao excluir arquivo.')
  } finally {
    modalExcluir.value = false
  }
}

// Drag & Drop
const handleDrop = () => {
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
  fetchUploadStatus()
  setInterval(fetchUploadStatus, 5000)
  eventBus.on('arquivo-arrastado', arquivo => (arquivoArrastado.value = arquivo as File))
  eventBus.on('limpar-arquivos-clp', () => (arquivosEmExecucao.value = []))
  eventBus.on('clp-atualizado', buscarArquivoEmExecucao)
  buscarArquivoEmExecucao()
})

onBeforeUnmount(() => eventBus.off('clp-atualizado', buscarArquivoEmExecucao))

watch([clpText, clpReiniciando], buscarArquivoEmExecucao)
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
