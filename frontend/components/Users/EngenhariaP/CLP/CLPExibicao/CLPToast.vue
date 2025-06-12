<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed top-20 right-4 w-72 bg-red-100 shadow-lg rounded-md ring-1 ring-red-400"
    >
      <div class="flex items-center px-3 py-2 space-x-2">
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
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
defineProps<{ show: boolean }>()
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
