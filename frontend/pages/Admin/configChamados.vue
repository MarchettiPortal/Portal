<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <div v-for="(opcao, index) in opcoes" :key="index"
      class="bg-[#202124] shadow-2xl transition-all duration-200 hover:scale-105 text-white h-52 w-48 rounded-lg flex flex-col justify-center items-center gap-2 cursor-pointer hover:bg-[#4c4d4f]">
      <Icon :icon="opcao.icon" class="w-12 h-12" />
      <p>{{ opcao.label }}</p>
    </div>

    
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "adm-layout",
  middleware: ['admin-only'],

});

import { Icon } from '@iconify/vue'

const opcoes = [
  { icon: 'material-symbols:settings-account-box-rounded', label: 'Configurar Opções' },
  { icon: 'material-symbols:settings-account-box-rounded', label: 'teste'}
]

</script>