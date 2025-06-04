<template>
  <div class="flex items-center rounded-xl gap-2 mb-4">
    <button
      @click="toggle"
      class="w-14 h-8 flex items-center bg-red-500 rounded-full p-1 relative transition-colors duration-300"
    >
      <!-- Bolinha com ícone dinâmico -->
      <div
        :class="[
          'w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-md transform transition-transform duration-300 z-10',
          modelValue === 'compra' ? 'translate-x-6' : 'translate-x-0'
        ]"
      >
        <Icon
          :name="modelValue === 'compra' ? 'ic:round-store' : 'ic:round-format-list-bulleted'"
          class="text-red-500 text-base"
        />
      </div>
      
    </button>
  </div>
  
</template>

<script setup lang="ts">
import { Icon } from '#components';

const props = defineProps<{
  modelValue: 'normal' | 'compra'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: 'normal' | 'compra'): void
}>()

function toggle() {
  emit('update:modelValue', props.modelValue === 'normal' ? 'compra' : 'normal')
}
</script>
