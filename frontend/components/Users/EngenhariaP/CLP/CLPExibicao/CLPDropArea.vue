<template>
  <div
    class="mx-6 my-6 p-6 border-2 border-dashed border-gray-400 rounded-md flex flex-col items-center justify-center text-center text-gray-500 hover:border-red-500 hover:text-black transition"
  >
    <Icon icon="material-symbols:upload" class="w-10 h-10 mb-2" />
    <p class="text-sm font-medium">Arraste e solte arquivos aqui para enviar</p>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>
