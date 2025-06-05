<template>
 <div class="flex items-center rounded-xl gap-2 mb-4">
    <button
      @click="alternar"
      class="w-14 h-8 flex items-center rounded-full p-1 relative transition-colors duration-300"
      :class="ativo ? 'bg-green-500' : 'bg-red-500'"
      :disabled="loading"
    >
      <!-- Bolinha com ícone dinâmico -->
      <div
        :class="[
          'w-6 h-6 flex items-center justify-center rounded-full bg-white shadow-md transform transition-transform duration-300 z-10',
          ativo ? 'translate-x-6' : 'translate-x-0'
        ]"
      >
        <Icon
          :name="ativo ? 'ic:baseline-autorenew' : 'ic:outline-power-settings-new'"
          class="text-red-500 text-base transition-colors duration-300"
        />
      </div>
    </button>
  </div>
  </template>
  
  <script setup lang="ts">
  import { Icon } from '#components';
  import { useAgendadorStore } from '~/stores/Milvus/agendador'
  import { storeToRefs } from 'pinia'

  const store = useAgendadorStore()
  const { ativo, loading } = storeToRefs(store)

  // Busca status atual do backend ao carregar
  await store.fetchStatus()

  // Alterna o status e envia para o backend
  function alternar() {
    store.toggleStatus(!ativo.value)
  }
  </script>
  