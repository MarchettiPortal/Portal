<template>
  <div class="absolute inset-y-0 right-0 flex items-center p-1 z-10">
    <button
      class="p-2 text-red-600 rounded-xs hover:bg-red-200 cursor-pointer transition-colors duration-200"
      aria-label="Filtro"
      @click="$emit('click')"
    >
      <Icon icon="material-symbols:filter-list-rounded" class="text-xl" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>
