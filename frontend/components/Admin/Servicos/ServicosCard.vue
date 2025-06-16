<template>
  <div
    class="relative flex flex-col gap-3 bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-300"
    :class="status === 'up' ? 'border-green-100' : 'border-red-100'"
  >
    <!-- Header com Status -->
    <div class="flex items-center gap-4">
      <div
        class="w-4 h-4 rounded-full"
        :class="status === 'up' ? 'bg-green-500' : 'bg-red-500'"
      ></div>

      <div class="flex-1 min-w-0">
        <p class="text-sm text-gray-600 truncate">{{ label }}</p>
        <p class="text-xs font-medium uppercase tracking-wider"
           :class="status === 'up' ? 'text-green-600' : 'text-red-600'">
          {{ status === 'up' ? 'Online' : 'Offline' }}
        </p>
      </div>

      <!-- Botão Restart -->
      <button
        @click="$emit('restart')"
        class="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Reiniciar"
      >
        <Icon icon="mdi:restart" class="w-4 h-4 text-gray-500" />
      </button>
    </div>

    <!-- Divider -->
    <div class="h-px bg-gray-100" />

    <!-- Indicador visual grande opcional -->
    <div class="flex justify-center pt-2">
      <Icon
        :icon="status === 'up' ? 'mdi:server' : 'mdi:alert-circle-outline'"
        :class="status === 'up' ? 'text-green-400' : 'text-red-400'"
        class="w-8 h-8"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  label: string
  status: 'up' | 'down'
}>()

const emit = defineEmits<{
  (e: 'restart'): void
}>()
</script>
