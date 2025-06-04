<template>
  <div class="border-t pt-2">
    <NuxtLink
      to=""
      class="hover:bg-red-700 cursor-pointer rounded-xs p-1 flex items-center gap-2"
    >
      <div class="w-6 h-6 flex items-center justify-center shrink-0">
        <Icon name="material-symbols:help-outline-rounded" size="24" />
      </div>
      <span
        class="transition-all duration-300 ease-in-out text-white"
        :class="expanded
          ? 'opacity-100 ml-2 w-auto'
          : 'opacity-0 ml-0 w-0 pointer-events-none'"
      >
        Ajuda
      </span>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
defineProps<{ expanded: boolean }>()
</script>
