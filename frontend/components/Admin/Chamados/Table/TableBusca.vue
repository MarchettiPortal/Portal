<template>
    <div class="relative w-52 mb-4">
      <!-- Ícone de busca -->
      <Icon
        name="ic:outline-search"
        class="absolute left-2 top-1/2 transform -translate-y-1/2"
      />
  
      <!-- Campo de busca -->
      <input
        :value="modelValue"
        @input="onInput"
        :placeholder="placeholder || 'Buscar...'"
        class="border-2 pl-8 pr-3 py-1 rounded-md w-full border-red-500 focus:outline-none"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { Icon } from '#components'
  
  defineProps<{
    modelValue: string
    placeholder?: string
  }>()
  
  const emit = defineEmits(['update:modelValue'])
  
  function onInput(e: Event) {
    emit('update:modelValue', (e.target as HTMLInputElement).value)
  }
  </script>
  