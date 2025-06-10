<template>
  <div class="p-6 bg-white shadow-lg rounded-xl border border-gray-200">
    <!-- Cabeçalho -->
    <div class="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Icon name="solar:archive-bold-duotone" class="w-6 h-6 text-red-500" />
        Logs de Envio
      </h2>

      <input
        v-model="search"
        type="text"
        placeholder="Buscar por usuário, arquivo..."
        class="w-full md:w-72 border border-gray-300 focus:ring-2 focus:ring-red-500 rounded-md px-3 py-2 text-sm text-gray-800"
      />
    </div>

    <!-- Tabela -->
    <div class="overflow-auto rounded-lg border border-gray-200">
      <table class="min-w-full text-sm text-left text-gray-700">
        <thead class="bg-gray-100 text-gray-700 font-semibold">
          <tr>
            <th class="px-4 py-2">Colaborador</th>
            <th class="px-4 py-2">CLP</th>
            <th class="px-4 py-2">Arquivo</th>
            <th class="px-4 py-2">Tamanho</th>
            <th class="px-4 py-2">Descrição</th>
            <th class="px-4 py-2">Data</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="log in paginatedLogs"
            :key="log.id"
            class="border-t border-gray-100 hover:bg-gray-50 transition"
          >
            <td class="px-4 py-2">{{ log.usuario }}</td>
            <td class="px-4 py-2">{{ log.clp_selecionado }}</td>
            <td class="px-4 py-2 truncate max-w-xs">{{ log.nome_arquivo }}</td>
            <td class="px-4 py-2">{{ log.tamanhoFormatado }}</td>
            <td class="px-4 py-2 truncate max-w-xs">{{ log.descricao }}</td>
            <td class="px-4 py-2">{{ log.dataFormatada }}</td>
          </tr>
          <tr v-if="pending" class="text-center text-gray-500">
            <td colspan="6" class="px-4 py-6">Carregando logs...</td>
          </tr>
          <tr v-if="!pending && !paginatedLogs.length" class="text-center text-gray-500">
            <td colspan="6" class="px-4 py-6">Nenhum log encontrado.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginação -->
    <div class="mt-6 flex justify-center items-center gap-2 text-sm">
      <button
        @click="page--"
        :disabled="page === 1"
        class="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
      >
        Anterior
      </button>
      <span>Página {{ page }} de {{ totalPages }}</span>
      <button
        @click="page++"
        :disabled="page >= totalPages"
        class="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
      >
        Próxima
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { config } from '~/config/global.config'

interface LogFtp {
  id: number
  clp_selecionado: string
  usuario: string
  nome_arquivo: string
  descricao: string
  data_envio: string
  tamanho: string | number
}

// Meta
definePageMeta({
  layout: 'adm-layout',
  middleware: ['permissao'],
})

// Fetch logs
const { data: logsRaw, pending } = await useAsyncData<LogFtp[]>(
  'ftp-logs',
  () => $fetch(`${config.API_BACKEND}/clp/logs`),
  { server: false, lazy: false }
)

function formatSize(size: number): string {
  return size > 0 ? `${(size / 1024).toFixed(2)} KB` : 'Tamanho inválido'
}

function formatDate(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return isNaN(d.getTime()) ? 'Data inválida' : d.toLocaleDateString()
}

const search = ref('')

const logs = computed(() => {
  return logsRaw.value?.map(log => ({
    ...log,
    tamanhoFormatado: formatSize(Number(log.tamanho)),
    dataFormatada: formatDate(log.data_envio),
  })) || []
})

const filteredLogs = computed(() => {
  if (!search.value) return logs.value
  const term = search.value.toLowerCase()
  return logs.value.filter(log =>
    [
      log.usuario,
      log.clp_selecionado,
      log.nome_arquivo,
      log.descricao,
      log.tamanhoFormatado,
      log.dataFormatada,
    ].some(field => field.toLowerCase().includes(term))
  )
})

const page = ref(1)
const perPage = 12

const totalPages = computed(() =>
  Math.ceil(filteredLogs.value.length / perPage)
)

const paginatedLogs = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredLogs.value.slice(start, start + perPage)
})
</script>
