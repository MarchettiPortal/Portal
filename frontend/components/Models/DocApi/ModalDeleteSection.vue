<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
  >
    <div class="bg-white text-black p-6 rounded-lg shadow-lg w-11/12 max-w-md animate-fade-in">
      <h3 class="text-lg font-semibold mb-4">Confirmar exclusão?</h3>
      <p class="mb-6">
        Você tem certeza que quer apagar a seção
        <strong class="font-medium">{{ title }}</strong>?
      </p>
      <div class="flex justify-end gap-3">
        <button
          @click="confirm"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer"
        >
          Sim, excluir
        </button>
        <button
          @click="close"
          class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  modelValue: boolean
  title: string
  id: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'confirm', id: number): void
}>()

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function confirm() {
  emit('confirm', props.id)
  close()
}
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
  animation: fade-in 0.2s ease-out;
}
</style>