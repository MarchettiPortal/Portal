<template>
  <div class="flex justify-center overflow-x-auto gap-6 px-4 mb-16 scrollbar-hide">
    <div
      v-for="categoria in categories"
      :key="categoria.name"
      class="flex flex-col pb-2 items-center text-gray-600 hover:text-black transition-all duration-200 cursor-pointer min-w-[60px]"
    >
      <Icon :icon="categoria.icon" class="w-6 h-6 mb-1" />
      <span class="text-xs text-center">{{ categoria.name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

// Lista de categorias com nomes de ícones da Iconify
const categories = [
  { name: 'OneDrive', icon: 'material-symbols:cloud-outline' },
  { name: 'PC', icon: 'material-symbols:desktop-windows-outline-rounded' },
  { name: 'Notebook', icon: 'material-symbols:computer-outline-rounded' },
  { name: 'TV', icon: 'material-symbols:tv-outline-rounded' },
  { name: 'Tablet', icon: 'material-symbols:tablet-android-outline-rounded' },
  { name: 'Celular', icon: 'material-symbols:phone-iphone-outline' },
]
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
