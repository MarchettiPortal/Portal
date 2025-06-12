<template>
  <div class="p-4 gap-4 flex items-center">
    <Icon
      icon="material-symbols:memory-rounded"
      class="text-black bg-gray-300 p-1 rounded-sm w-8 h-8"
    />
    <div class="flex flex-col">
      <h1 class="text-black text-lg">Em execução:</h1>
      <p class="text-gray-400 text-sm">{{ clpText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { Icon } from '@iconify/vue'
const props = defineProps<{ clpText: string }>()
</script>
