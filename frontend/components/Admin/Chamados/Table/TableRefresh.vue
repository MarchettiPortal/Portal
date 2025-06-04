<template>
        <div class="flex items-center justify-end gap-2 mb-4">
                <button 
                        @click="refresh"
                        class="bg-red-500 text-white rounded-md px-2 py-1 flex items-center gap-2 transition duration-300 hover:bg-red-700">
                        <Icon name="ic:round-refresh" class="text-base w-6 h-6" />
                </button>
        </div>
</template>
<script setup lang="ts">
import { Icon } from '#components'

const emit = defineEmits(['refresh'])

function refresh() {
  emit('refresh')
}



</script>