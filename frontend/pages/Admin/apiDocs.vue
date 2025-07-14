<template>
  <div class="w-full h-full shadow-md overflow-y-auto">
    <APISide />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'adm-layout',
  middleware: ['permissao']
})

import APISide from '~/components/Admin/DocApi/APISide.vue';

</script>
