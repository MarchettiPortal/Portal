<template>
  <div class="flex justify-between items-center mb-4">
    <div class="flex items-center gap-4 flex-1">
      <!-- Botões de tipo -->
      <div class="flex gap-2">
        <button @click="$emit('trocarTipo', 'usuarios')" :class="[
          'px-4 py-2 rounded-xs font-semibold h-10 cursor-pointer',
          tipoSelecionado === 'usuarios' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
        ]">
          Usuários (200)
        </button>
        <button @click="$emit('trocarTipo', 'usuarios_servico')" :class="[
          'px-4 py-2 rounded-xs font-semibold h-10 cursor-pointer',
          tipoSelecionado === 'usuarios_servico' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
        ]">
          Usuários de Serviços (5)
        </button>
      </div>

      <!-- Campo de busca + botão filtro -->
      <div class="relative flex-1">
        <usersSearch class="h-10" @buscar="$emit('buscar', $event)" />
        <usersFilter @click="$emit('filtro')" />
      </div>
    </div>

    <!-- Botão adicionar -->
    <button @click="$emit('adicionar')"
      class="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 cursor-pointer rounded-xs shadow transition-all duration-300 h-10">
      + Adicionar Usuário
    </button>
  </div>
</template>

<script setup lang="ts">
import usersSearch from './usersSearch.vue'
import usersFilter from './usersFilter.vue'

defineProps<{ tipoSelecionado: 'usuarios' | 'usuarios_servico' }>()
</script>
