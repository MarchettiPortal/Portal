<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/40 flex justify-center items-center backdrop-blur-sm z-50"
  >
    <div class="bg-white p-6 rounded-md shadow-md w-full max-w-md text-black">
      <h2 class="text-lg font-semibold mb-4">Confirmar Exclusão</h2>
      <p>
        Tem certeza que deseja excluir
        <strong>{{ arquivoName }}</strong>?
      </p>
      <div class="flex justify-end gap-2 mt-4">
        <button
          @click="onConfirm"
          class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Excluir
        </button>
        <button
          @click="onCancel"
          class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  arquivoName: string
}>()

const emits = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'confirm'): void
}>()

function onConfirm() {
  emits('confirm')
}

function onCancel() {
  emits('update:show', false)
}
</script>
