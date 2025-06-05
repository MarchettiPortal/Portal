<template>
  <div>
    <!-- Div clicável -->
    <div 
      class="ml-6 bg-white h-10 w-76 text-black flex items-center p-2 rounded-xs cursor-pointer hover:bg-gray-100 transition"
      @click="showModal = true"
    >
      <div class="w-8 h-8 rounded-full  bg-gray-100 flex items-center justify-center overflow-hidden relative">
  <img
    v-if="hasValidPhoto"
    :src="auth.user.photo"
    @error="handleImageError"
    class="w-full h-full object-cover rounded-full absolute"
  />

  <Icon
    v-else
    name="material-symbols:person-rounded"
    class="text-black w-6 h-6 z-10"
  />
</div>

      <div class="ml-4 flex flex-col">
        <p class="font-semibold text-sm">{{ auth.user?.name || 'Erro Busca Usuário' }}</p>
        <p class="text-xs">{{ auth.user?.email || 'Erro Busca do E-mail' }}</p>
      </div>
    </div>

    <!-- Modal externo -->
    <ProfileModal v-if="showModal" @close="showModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/User/auth';
import ProfileModal from '~/components/Models/ProfileModel.vue';
import { Icon } from '@iconify/vue';

const auth = useAuthStore();
const hasValidPhoto = ref(true);
const showModal = ref(false);

const handleImageError = () => {
  hasValidPhoto.value = false;
};

onMounted(async () => {
  await auth.fetchUser();
  await auth.fetchUserPhoto();

  // Verifica se a foto existe e não é uma string vazia
  if (!auth.user?.photo || auth.user.photo.trim() === '') {
    hasValidPhoto.value = false;
  }
});
</script>
