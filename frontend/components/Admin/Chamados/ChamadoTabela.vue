<template>
  <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
    <!-- Campo de busca -->
    <div class="relative w-52">
      <Icon
        name="ic:outline-search"
        class="absolute left-2 top-1/2 transform -translate-y-1/2"
      />
      <input
        :value="search"
        @input="e => emit('update:search', (e.target as HTMLInputElement).value)"
        :placeholder="placeholder || 'Buscar...'"
        class="border-2 pl-8 pr-3 py-1 rounded-md w-full border-red-500 focus:outline-none"
      />
    </div>

    <!-- Botões: troca, auto-refresh, refresh -->
    <div class="flex items-center gap-2">
      <!-- Troca -->
      <button
        @click="emit('update:mode', mode === 'normal' ? 'compra' : 'normal')"
        class="w-14 h-8 flex items-center bg-red-500 rounded-full p-1 relative transition-colors duration-300"
      >
        <div
          :class="[
            'w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-md transform transition-transform duration-300 z-10',
            mode === 'compra' ? 'translate-x-6' : 'translate-x-0'
          ]"
        >
          <Icon
            :name="mode === 'compra' ? 'ic:round-store' : 'ic:round-format-list-bulleted'"
            class="text-red-500 text-base"
          />
        </div>
      </button>

      <!-- AutoRefresh -->
      <button
        @click="emit('toggleAuto')"
        class="w-14 h-8 flex items-center rounded-full p-1 relative transition-colors duration-300"
        :class="isAutoOn ? 'bg-green-500' : 'bg-red-500'"
        :disabled="isLoading"
      >
        <div
          :class="[
            'w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-md transform transition-transform duration-300 z-10',
            isAutoOn ? 'translate-x-6' : 'translate-x-0'
          ]"
        >
          <Icon
            :name="isAutoOn ? 'ic:baseline-autorenew' : 'ic:outline-power-settings-new'"
            class="text-red-500 text-base"
          />
        </div>
      </button>

      <!-- Refresh -->
      <button
        @click="emit('refresh')"
        class="bg-red-500 text-white rounded-md px-2 py-1 flex items-center gap-2 transition duration-300 hover:bg-red-700"
      >
        <Icon name="ic:round-refresh" class="text-base w-6 h-6" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '#components'

const props = defineProps<{
  search: string
  placeholder?: string
  mode: 'normal' | 'compra'
  isAutoOn: boolean
  isLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:mode', value: 'normal' | 'compra'): void
  (e: 'toggleAuto'): void
  (e: 'refresh'): void
}>()
</script>
