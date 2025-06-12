<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
  >
    <div class="bg-white rounded-md shadow-lg p-6 w-full max-w-sm text-center text-black">
      <Icon icon="line-md:loading-loop" class="w-10 h-10 mx-auto mb-4 animate-spin text-red-600" />
      <p class="text-md font-medium">Enviando arquivo...</p>
      <p class="text-sm text-gray-500">Por favor, aguarde um instante.</p>
    </div>
  </div>
</template>
 
<script setup lang="ts">
    import { Icon } from '@iconify/vue'
    
    const props = defineProps<{ show: boolean }>()
</script>