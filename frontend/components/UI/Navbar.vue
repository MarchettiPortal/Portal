<template>
  <!-- Navbar -->
  <div class="w-full bg-red-700 border-b h-14 flex items-center px-4">
    <!-- Título -->
    <p class="text-white text-xl">Portal de Chamados</p>

    <!-- Notificação -->
    <div class="bg-white w-10 h-10 ml-auto flex items-center rounded-xs justify-center">
      <Icon icon="garden:notification-stroke-16" style="color: black" size="24" />
    </div>

    <!-- Perfil do Usuário -->
    <div>
      <!-- Clicável -->
      <div
        class="ml-6 bg-white h-10 text-black flex items-center p-2 rounded-xs cursor-pointer hover:bg-gray-100 transition"
        @click="showModal = true"
      >
        <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden relative">
          <img
            v-if="hasValidPhoto"
            :src="auth.user?.photo"
            @error="handleImageError"
            class="w-full h-full object-cover rounded-full absolute"
          />
          <Icon
            v-else
            icon="material-symbols:person-rounded"
            class="text-black w-6 h-6 z-10"
          />
        </div>

        <div class="ml-4 flex flex-col">
          <p class="font-semibold text-sm">{{ auth.user?.name || 'Erro Busca Usuário' }}</p>
          <p class="text-xs">{{ auth.user?.email || 'Erro Busca do E-mail' }}</p>
        </div>
      </div>

      <!-- Modal -->
      <ProfileModal v-if="showModal" @close="showModal = false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import ProfileModal from '~/components/Models/ProfileModel.vue'; // certifique-se que o nome do arquivo é correto (ProfileModel.vue)
import { useAuthStore } from '~/stores/User/auth'; // ajuste o caminho conforme sua estrutura

const showModal = ref(false);
const hasValidPhoto = ref(true);
const auth = useAuthStore();

const handleImageError = () => {
  hasValidPhoto.value = false;
};

onMounted(async () => {
  await auth.fetchUser?.();
  await auth.fetchUserPhoto?.();

  if (!auth.user?.photo || auth.user.photo.trim() === '') {
    hasValidPhoto.value = false;
  }
});

</script>
