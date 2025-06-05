<!-- pages/unauthorized.vue -->

<template>
    <div class="p-6 text-center">
      <h1 class="text-2xl text-red-600">Acesso negado</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      <button @click="logout" class="border-2 rounded-xs p-2 w-16 h-8 items-center">teste</button>
    </div>
  </template>

<script setup lang="ts">  
  import { useAuthStore } from '~/stores/User/auth';
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';

  const auth = useAuthStore();
  const router = useRouter();

  onMounted(async () => {
    await auth.fetchUser(); // Busca os dados do usuário
  });

  if (!auth.user) {
    router.push('/login');
  }

  import { config } from '~~/config/global.config'
    const logout = async () => {
      await auth.logout();
    };


</script>
  