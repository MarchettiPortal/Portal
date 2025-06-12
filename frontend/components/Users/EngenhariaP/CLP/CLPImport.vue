<template>
  <div class="rounded-sm shadow-md border bg-white">
    <!-- Header -->
    <div class="p-4 flex items-center gap-4">
      <Icon icon="material-symbols:hard-drive-outline" class="h-8 w-8 text-black bg-gray-300 rounded-sm p-1" />
      <div>
        <h1 class="text-lg font-medium text-black">Arquivos locais</h1>
        <p class="text-sm text-gray-400">Arraste para o CLP à direita</p>
      </div>
      <div class="ml-auto">
        <input
          ref="fileInputRef"
          type="file"
          class="hidden"
          multiple
          accept=".csv,.txt,.json"
          @change="handleFileChange"
        />
        <button
          @click="triggerFileInput"
          class="text-black flex items-center gap-2 rounded-sm transition cursor-pointer hover:bg-gray-200 bg-gray-300 p-2"
        >
          <Icon icon="material-symbols:drive-folder-upload-outline-rounded" class="h-6 w-6" />
          Importar
        </button>
      </div>
    </div>

    <!-- Lista de Arquivos -->
    <div v-if="arquivos.length === 0" class="p-6 text-center text-gray-400">
      Nenhum arquivo selecionado.
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      <div
        v-for="(arquivo, index) in arquivos"
        :key="index"
        draggable="true"
        @dragstart="(e) => handleDragStart(e, arquivo)"
        class="rounded-md p-4  hover:bg-gray-200 transition cursor-move"
      >
        <Icon icon="material-symbols:description" class="w-10 h-10 text-black mb-2" />
        <p class="font-semibold text-black text-sm truncate">{{ arquivo.name }}</p>
        <ul class="text-xs text-gray-600 mt-2 space-y-0.5">
          <li><strong>Tamanho:</strong> {{ formatSize(arquivo.size) }}</li>
          <li><strong>Tipo:</strong> {{ arquivo.type || 'N/A' }}</li>
          <li><strong>Modificado:</strong> {{ formatDate(arquivo.lastModified) }}</li>
        </ul>
        <button
          @click="removerArquivo(index)"
          class="mt-3 text-red-600 hover:text-red-800 cursor-pointer text-xs flex items-center gap-1"
        >
          <Icon icon="material-symbols:delete-outline" class="w-4 h-4" />
          Excluir
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

const arquivos = ref<File[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileChange(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files || [])
  arquivos.value.push(...files)
}

function removerArquivo(index: number) {
  arquivos.value.splice(index, 1)
}

function formatSize(size: number) {
  return `${(size / 1024).toFixed(2)} KB`
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString()
}

function handleDragStart(event: DragEvent, arquivo: File) {
  const payload = {
    nomeArquivo: arquivo.name,
    tamanho: formatSize(arquivo.size),
    tipo: arquivo.type || 'N/A',
    data: formatDate(arquivo.lastModified)
    // ⚠️ Não incluir "usuario" aqui!
  }
  event.dataTransfer?.setData('application/json', JSON.stringify(payload))
}
</script>
