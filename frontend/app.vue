<template>
  <NuxtLayout>
   <NuxtPage />
  </NuxtLayout>
</template>

<style>
</style>

<script setup> 

import { useAuthStore } from "~/stores/User/auth"; // Importa a store de autenticação
import { onMounted } from "vue"; // Import para inicializar com a pagina
import { usePermissionStore } from '@/stores/User/permissions'; // Importa a store de permissão

const auth = useAuthStore(); // Inicializa a store
const perms = usePermissionStore(); // Inicializa a store

// 1) Carrega o usuário ao iniciar a aplicação
onMounted(async () => {
  await auth.fetchUser(); 
});

watch(
  () => auth.user,
  async (user) => {
    if (user) {
      // 2) Assim que auth.user existir (com user.groups), busca permissões
      await perms.fetchPermissoes();
    } else {
      perms.permissoes = [];
    }
  },
  { immediate: true }
);
</script>