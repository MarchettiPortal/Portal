<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center "
  >
    <div class="bg-white text-black p-6 rounded-lg shadow-lg w-11/12 max-w-md animate-fade-in ">
      <h3 class="text-lg font-semibold mb-4">Criar nova seção</h3>
      <div class="mb-6">
        <label for="section-title" class="block text-sm font-medium mb-1">
          Nome da seção
        </label>
        <input
          id="section-title"
          type="text"
          v-model="title"
          class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
          placeholder="Digite o nome da seção"
        />
      </div>
      <div class="flex justify-end gap-3">
        <button
          @click="confirm"
          :disabled="!title.trim()"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Criar
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
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  // opcional: valor inicial se quiser editar depois
  initialTitle?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'confirm', title: string): void
}>()

// título vinculado ao input
const title = ref(props.initialTitle ?? '')

// se modelValue ficar false externamente, zera o campo
watch(() => props.modelValue, (val) => {
  if (!val) title.value = props.initialTitle ?? ''
})

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function confirm() {
  const trimmed = title.value.trim()
  if (!trimmed) return
  emit('confirm', trimmed)
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