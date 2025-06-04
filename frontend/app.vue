<template>
  <NuxtLayout>
   <NuxtPage />
  </NuxtLayout>
</template>

<style>
</style>

<script setup> 

import { useAuthStore } from "@/stores/auth"; // Importa a store de autenticação
import { onMounted } from "vue";
import { storeToRefs } from "pinia"; // Facilita a reatividade

const auth = useAuthStore(); // 🔥 Inicializa a store
const { user } = storeToRefs(auth); // Mantém a reatividade

onMounted(async () => {
await auth.fetchUser(); // 🔥 Busca o usuário autenticado
});
</script>