<template>
  <div class="p-4">
    <div class="mb-4 flex items-center justify-between gap-4">
      <h2 class="text-xl font-semibold text-black">Logs de Envio</h2>

      <!-- Campo de busca -->
      <UInput
        v-model="search"
        variant="none"
        placeholder="Buscar..."
        class="w-64 text-black"
        :ui="{ base: ' text-black border border-black' }"
      />
    </div>

    <!-- Tabela -->
    <UTable
      :data="paginatedLogs"
      :columns="columns"
      class="w-full text-black rounded-sm "
      :isLoading="pending"
      emptyText="Carregando ou nenhum log encontrado."
      :ui="{
        th: 'text-black',
        tr: 'hover:bg-gray-400',
        td: 'text-black'
      }"
    />

    <!-- Paginação -->
    <div class="mt-4 flex justify-center">
      <UPagination
        v-model:page="page"
        :total="filteredLogs.length"
        :items-per-page="perPage"
        :sibling-count="1"
        color="error"
        activeColor="error"
        :ui="{
          
        }"
      />
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

// Components
const UTable = resolveComponent('UTable')
const UInput = resolveComponent('UInput')
const UPagination = resolveComponent('UPagination')

definePageMeta({ layout: 'adm-layout' })

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
  if (isNaN(d.getTime())) return 'Data inválida'
  return d.toLocaleDateString()
}

// Refs
const search = ref('')

// Formatar logs
const logs = computed(() => {
  if (!logsRaw.value) return []
  return logsRaw.value.map((log) => ({
    ...log,
    tamanhoFormatado: formatSize(Number(log.tamanho)),
    dataFormatada: formatDate(log.data_envio),
  }))
})

// Filtro apenas por texto
const filteredLogs = computed(() => {
  if (!search.value) return logs.value

  const term = search.value.toLowerCase()
  return logs.value.filter((log) =>
    [
      log.usuario,
      log.clp_selecionado,
      log.nome_arquivo,
      log.descricao,
      log.tamanhoFormatado,
      log.dataFormatada,
    ].some((field) => field.toLowerCase().includes(term))
  )
})

// Paginação
const page = ref(1)
const perPage = 12
const paginatedLogs = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredLogs.value.slice(start, start + perPage)
})

// Colunas
const columns = [
  { accessorKey: 'usuario', header: 'Colaborador' },
  { accessorKey: 'clp_selecionado', header: 'CLP' },
  { accessorKey: 'nome_arquivo', header: 'Arquivo' },
  {
    accessorKey: 'tamanhoFormatado',
    header: 'Tamanho',
    cell: (info: { getValue: () => any }) => info.getValue(),
  },
  { accessorKey: 'descricao', header: 'Descrição' },
  {
    accessorKey: 'dataFormatada',
    header: 'Data',
    cell: (info: { getValue: () => any }) => info.getValue(),
  },
]
</script>
