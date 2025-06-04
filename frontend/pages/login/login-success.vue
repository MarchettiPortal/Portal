<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
 
onMounted(async () => {
  await auth.fetchUser();

  // Redireciona com base na role futuramente, aqui apenas verifica se logado
 
  if (auth.user) {
    router.push('/admin/home'); // Depois fazer a lógica de admin/user/outro grupo
  } else {
    router.push('/login');
  }
});

</script>

<template>
  <div class="p-4 text-center">
    <p class="text-xl">Autenticando...</p>
  </div>
</template>
