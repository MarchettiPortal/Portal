<template>
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
              @click="onSelecionar(arq)"
              class="text-xs px-2 py-1 bg-red-600 cursor-pointer text-white rounded hover:bg-red-700 transition"
            >
              Selecionar
            </button>
            <button
              @click="onRemover(arq.nomeArquivo)"
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
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { Icon } from '@iconify/vue'
import type { Arquivo } from '../types'

const props = defineProps<{ arquivosPendentes: Arquivo[]; uploadLocked: boolean }>()
const emit = defineEmits<{
  (e: 'selecionar', arq: Arquivo): void
  (e: 'remover', nome: string): void
}>()

function onSelecionar(arq: Arquivo) {
  if (props.uploadLocked) {
    emit('selecionar', arq) // o pai exibe o toast por conta do lock
  } else {
    emit('selecionar', arq)
  }
}

function onRemover(nome: string) {
  emit('remover', nome)
}
</script>
