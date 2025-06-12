<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm">
    <div
      class="bg-white w-full max-w-3xl rounded-xs shadow-2xl p-6 relative animate-fade-in"
    >
      <!-- Cabeçalho -->
      <div class="flex justify-between items-start gap-6 border-b pb-4">
        <div class="flex items-center gap-4">
          <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-300">
            <img
              v-if="hasValidPhoto"
              :src="auth.user?.photo"
              class="w-full h-full object-cover rounded-full"
              @error="handleImageError"
            />
            <Icon
              v-else
              name="lucide:user"
              class="text-gray-500 w-8 h-8"
            />
          </div>
          <div class="flex flex-col">
            <p class="text-xl font-semibold text-gray-800">{{ auth.user?.name || 'Erro Busca Usuário' }}</p>
            <p class="text-sm text-gray-500">{{ groupNames|| 'Erro Busca Setor' }}</p>
            <p class="text-sm text-gray-400">{{ auth.user?.email || 'Erro Busca do E-mail' }}</p>
          </div>
        </div>
        <!-- Botão Fechar -->
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-red-500 cursor-pointer transition text-2xl font-bold leading-none"
        >
          &times;
        </button>
      </div>

      <!-- Conteúdo -->
      <div class="mt-6 text-gray-700 text-center text-lg">
        teste
      </div>

      <!-- Botão Logout -->
      <div class="mt-10 flex justify-end">
        <button
          @click="LogoutButton"
          class="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-xs cursor-pointer hover:bg-red-700 transition"
        >
          <Icon name="lucide:log-out" class="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/User/auth';

const auth = useAuthStore();
const hasValidPhoto = ref(false);

const handleImageError = () => {
  console.error('Erro ao carregar a imagem');
  hasValidPhoto.value = false;
};

const groupNames = computed(() => {
  if (!auth.user?.grupos?.length) return ''
  return auth.user.grupos
    .map((g: any) => g.nome)   // `<any>` aqui impede o conflito
    .join(' | ')
})



onMounted(async () => {
  await auth.fetchUser();
  hasValidPhoto.value = !!auth.user?.photo && auth.user.photo !== '';
});

const LogoutButton = () => {
  auth.logout();
};
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
