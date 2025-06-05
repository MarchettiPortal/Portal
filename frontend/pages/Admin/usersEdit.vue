<template>
  <div class="flex flex-col h-full">
      <usersMain />
  </div>
</template>

<script setup lang="ts">
import usersMain from '~/components/Admin/UsersEdit/usersView.vue';

definePageMeta({
  layout: 'adm-layout'
});
</script>
