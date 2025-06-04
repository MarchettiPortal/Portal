<template>
  <div class="relative w-full">
    <!-- Ícone de busca -->
    <Icon
      icon="material-symbols:search"
      class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl pointer-events-none"
    />

    <!-- Input -->
    <input
      v-model="busca"
      type="text"
      placeholder="Buscar por nome ou email..."
      class="w-full pl-12 pr-14 py-2 rounded-xs bg-white shadow-sm focus:outline-none transition-all duration-300 text-gray-700 placeholder-gray-400"
      @keyup.enter="emitirBusca"
      aria-label="Campo de busca"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

const busca = ref('')
const emit = defineEmits(['buscar'])

function emitirBusca() {
  emit('buscar', busca.value.trim())
}
</script>
