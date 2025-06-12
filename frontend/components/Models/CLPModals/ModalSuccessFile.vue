<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <div
      class="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center justify-center w-64 h-64 space-y-4"
    >
      <!-- Ícone minimalista -->
      <Icon
        icon="material-symbols:check-circle-rounded"
        class="w-12 h-12 text-green-500"
      />
      <p class="text-lg font-semibold text-green-600">Enviado com sucesso!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
const props = defineProps<{ show: boolean }>()
</script>
