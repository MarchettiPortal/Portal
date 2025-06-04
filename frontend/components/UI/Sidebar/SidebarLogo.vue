<template>
  <NuxtLink
    to="/"
    class="rounded-xs mt-2 flex items-center gap-2 transition-all duration-300"
  >
    <div class="w-8 h-8 flex items-center justify-center shrink-0">
      <img src="/images/logo.png" alt="Logo" class="w-12 h-12 object-contain" />
    </div>

    <div
      class="flex flex-col leading-tight overflow-hidden transition-all duration-300"
      :class="expanded
        ? 'opacity-100 ml-2 w-auto'
        : 'opacity-0 ml-0 w-0 pointer-events-none'"
    >
      <p class="font-semibold whitespace-nowrap">Marchetti</p>
      <p class="text-gray-500 text-sm whitespace-nowrap">Sistema Interno</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{ expanded: boolean }>()
</script>
