<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-xs shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative p-8 animate-fade-in"
    >
      <!-- Botão de fechar -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-500 cursor-pointer hover:text-gray-800 transition-colors"
        aria-label="Fechar"
      >
        <Icon icon="material-symbols:close" class="w-6 h-6" />
      </button>

      <!-- Título -->
      <h2 class="text-2xl font-bold text-gray-800 mb-8">Detalhes do Usuário</h2>

      <!-- Informações do usuário -->
      <div class="grid sm:grid-cols-2 gap-6">
        <UserInfo label="Nome" :value="user.nome" />
        <UserInfo label="Email" :value="user.email" />
        <UserInfo label="Setor" :value="user.setor" />
        <UserInfo label="Licença" :value="user.licenca" />
        <UserInfo label="Status" :value="user.status" class="sm:col-span-2" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { Icon } from '@iconify/vue'

// Componente de item reutilizável
const UserInfo = defineComponent({
  props: {
    label: String,
    value: String
  },
  template: `
    <div class="flex justify-between items-center border-b pb-2">
      <p class="text-gray-600 font-medium">
        <span class="text-gray-800">{{ label }}:</span> {{ value }}
      </p>
      <button class="text-gray-400 hover:text-gray-600 transition-colors" :aria-label="'Editar ' + label">
        <Icon icon="material-symbols:edit" class="w-5 h-5" />
      </button>
    </div>
  `
})

// Props principais
const props = defineProps<{
  show: boolean
  user: {
    nome: string
    email: string
    setor: string
    licenca: string
    status: string
  }
}>()
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
  animation: fade-in 0.2s ease-out;
}
</style>
