<template>
  <div class="overflow-x-auto bg-white shadow rounded-xs">
    <table class="min-w-full table-fixed divide-y divide-gray-200">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-48">Nome</th>
          <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-64">Email</th>
          <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-40">Setor</th>
          <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-32">Licença</th>
          <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-32">Status</th>
          <th class="px-6 py-3 text-center text-sm font-semibold text-gray-700 w-32">Ações</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        <tr v-for="user in usuarios" :key="user.email" class="hover:bg-gray-50">
          <td class="px-6 py-2 text-sm text-gray-800 truncate">{{ user.nome }}</td>
          <td class="px-6 py-2 text-sm text-gray-600 truncate">{{ user.email }}</td>
          <td class="px-6 py-2 text-sm text-gray-600">{{ user.setor }}</td>
          <td class="px-6 py-2 text-sm text-gray-600">{{ user.licenca }}</td>
          <td class="px-6 py-2">
            <span :class="statusClass(user.status)">
              {{ user.status }}
            </span>
          </td>
          <td class="px-6 py-2 text-center align-middle">
            <div class="flex justify-center items-center h-full space-x-2">
              <button @click="$emit('ver', user)"
                class="w-10 h-10 flex items-center justify-center cursor-pointer text-red-600 hover:text-red-700"
                title="Ver detalhes">
                <Icon icon="material-symbols:visibility-outline-rounded" class="w-5 h-5" />
              </button>
              <button @click="$emit('editar', user)"
                class="w-10 h-10 flex items-center justify-center cursor-pointer text-red-600 hover:text-red-700"
                title="Editar usuário">
                <Icon icon="material-symbols:edit-square-outline-rounded" class="w-5 h-5" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

const props = defineProps<{
  usuarios: {
    nome: string
    email: string
    setor: string
    licenca: string
    status: string
  }[],
  onVerDetalhes?: (usuario: any) => void
}>()


function statusClass(status: string) {
  const classes: Record<string, string> = {
    Ativo: 'inline-flex items-center px-2 py-0.5 rounded-xs text-xs font-medium bg-green-100 text-green-800',
    Inativo: 'inline-flex items-center px-2 py-0.5 rounded-xs text-xs font-medium bg-red-100 text-red-800'
  }
  return classes[status] || 'inline-flex items-center px-2 py-0.5 rounded-xs text-xs font-medium bg-gray-100 text-gray-800'
}
</script>
