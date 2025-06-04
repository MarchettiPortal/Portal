<template>
    <aside
      @mouseenter="isExpanded = true"
      @mouseleave="isExpanded = false"
      class="h-full bg-[#202124] text-white p-4 pt-1 flex flex-col transition-all duration-300"
      :class="isExpanded ? 'w-64' : 'w-16'"
    >
      <div class="flex-1">
        <SidebarLogo :expanded="isExpanded" />
        <SidebarMenu :expanded="isExpanded" />
      </div>
      <SidebarHelp :expanded="isExpanded" />
    </aside>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import SidebarLogo from './UI/Sidebar/SidebarLogo.vue';
  import SidebarMenu from './UI/Sidebar/SidebarMenu.vue';
  import SidebarHelp from './UI/Sidebar/SidebarHelp.vue';

  const isExpanded = ref(false)
  </script>