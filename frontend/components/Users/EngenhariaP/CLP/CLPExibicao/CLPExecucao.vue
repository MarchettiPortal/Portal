<!-- CLPExecucao.vue -->
<template>
  <div class="p-6">
    <div v-if="!arquivos.length" class="text-center text-gray-400">
      Nenhum arquivo enviado ainda.
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
      <div
        v-for="(arquivo, index) in arquivos"
        :key="index"
        class="rounded-md p-4 transition-all duration-300"
      >
        <Icon
          icon="material-symbols:description"
          class="w-10 h-10 text-black mb-2"
        />
        <div class="flex flex-col min-h-[48px] justify-between">
          <div
            v-if="editandoArquivo === arquivo.nomeArquivo"
            class="flex w-full items-center"
          >
            <input
              v-model="nomeEditadoLocal"
              @keyup.enter="emitConfirmar(arquivo)"
              @blur="emitConfirmar(arquivo)"
              class="w-full text-sm p-1 text-black rounded border border-gray-300 outline-none"
              autofocus
            />
            <span class="ml-1 text-sm font-semibold text-gray-600">
              .CSV
            </span>
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
              @click="$emit('ativar-edicao', arquivo)"
              title="Renomear arquivo"
              class="text-gray-500 hover:text-black shrink-0"
            >
              <Icon
                icon="material-symbols:edit"
                class="w-4 h-4 cursor-pointer"
              />
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
            @click="$emit('abrir-modal-excluir', arquivo)"
            class="text-red-600 hover:text-red-800 cursor-pointer text-xs flex items-center gap-1"
          >
            <Icon
              icon="material-symbols:delete-outline"
              class="w-4 h-4"
            />
            Excluir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import type { Arquivo } from '../types'

const props = defineProps<{
  arquivos: Arquivo[]
  editandoArquivo: string | null
  nomeEditado: string
}>()

const emit = defineEmits<{
  (e: 'baixar', arquivo: Arquivo): void
  (e: 'ativar-edicao', arquivo: Arquivo): void
  (e: 'confirmar-renomear-inline', arquivo: Arquivo): void
  (e: 'abrir-modal-excluir', arquivo: Arquivo): void
  // Evento que atualiza o v-model do nome editado
  (e: 'update:nomeEditado', valor: string): void
}>()

// Para manter v-model no input local e só emitir quando confirmar
const nomeEditadoLocal = ref(props.nomeEditado)
watch(
  () => props.nomeEditado,
  v => (nomeEditadoLocal.value = v)
)

function emitConfirmar(arquivo: Arquivo) {
  // primeiro, avisa o pai qual foi o novo texto digitado
  emit('update:nomeEditado', nomeEditadoLocal.value)
  // então dispara a confirmação da renomeação
  emit('confirmar-renomear-inline', arquivo)
}
</script>
