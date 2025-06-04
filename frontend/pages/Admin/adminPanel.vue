<template>
  <div class="flex flex-wrap gap-4 max-w-[1000px] mx-auto justify-center">
    <button class="border-2">
      <p>teste</p>
    </button>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "adm-layout"
})

import { Icon } from '@iconify/vue'

const opcoes = [
  { icon: 'material-symbols:settings-account-box-rounded', label: 'Configurar Opções' },
]
</script>
