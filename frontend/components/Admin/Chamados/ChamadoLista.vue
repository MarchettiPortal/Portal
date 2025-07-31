<template>
  <div class="border-t-2 border-b-2 border-red-500 p-6 w-full h-full rounded-xl">
    <div class="rounded-lg w-full h-full">

      <!-- Barra superior fixa -->

      <div class="flex justify-between mb-4">
        <ChamadoTabela :search="search" :mode="tipoChamado" :is-auto-on="statusBotaoAgendador === 'online'" :is-loading="false"
          @update:search="search = $event" @update:mode="tipoChamado = $event"
            @toggleAuto="toggleAgendadorStatus" @refresh="fetchChamados" />
      </div>

      <!-- Tabela sem scrollbar -->
      <table class="w-full text-left table-fixed border-separate border-spacing-0">
        <thead class="bg-gray-300">
          <tr>
            <th class="p-2 border-b border-gray-400 w-[90px]">ID</th>
            <th class="p-2 border-b border-gray-400">Assunto</th>
            <th class="p-2 border-b border-gray-400">Colaborador</th>
            <th class="p-2 border-b border-gray-400">Status</th>
            <th class="p-2 border-b border-gray-400">Prioridade</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, i) in paginatedChamados" :key="i" class="hover:bg-gray-100 cursor-pointer"
            @click="selecionarChamado(c.codigo)">
            <td class="p-2 truncate text-sm transition-all duration-200 " :title="c.codigo">
              {{ c.codigo }}
            </td>
            <td class="p-2 max-w-[200px] truncate text-sm" :title="c.assunto">
              {{ c.assunto }}
            </td>
            <td class="p-2 max-w-[250px] truncate text-sm" :title="c.usuario_chamado">
              {{ c.usuario_chamado }}
            </td>
            <td class="p-2 max-w-[250px] truncate text-sm" :title="c.status">
              {{ c.status }}
            </td>
            <td class="p-2">
              <span class="px-2 py-1 rounded-full text-xs font-semibold" :class="prioridadeClasse(c.prioridade)">
                {{ c.prioridade }}
              </span>
            </td>
          </tr>
          <tr v-if="paginatedChamados.length === 0">
            <td colspan="5" class="text-center p-4 text-gray-500">
              Nenhum chamado encontrado
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginação -->
      <div class="flex justify-center items-center gap-2 mt-6">
        <button class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50" @click="currentPage--"
          :disabled="currentPage === 1">
          Anterior
        </button>
        <span>Página {{ currentPage }} de {{ totalPages }}</span>
        <button class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50" @click="currentPage++"
          :disabled="currentPage === totalPages">
          Próxima
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useChamadosStore } from '~/stores/Milvus/chamados'
import { storeToRefs } from 'pinia'
import ChamadoTabela from './ChamadoTabela.vue'
import { useAgendadorStore } from '~/stores/Milvus/agendador'
import { io } from 'socket.io-client'
import { config } from '~/config/global.config'

// Tipos
type ChamadoType = 'normal' | 'compra'
type AutoRefreshStatus = 'online' | 'offline'

// Refs e Stores
const tipoChamado = ref<ChamadoType>('normal')
const search = ref('')
const currentPage = ref(1)
const statusBotaoAgendador = ref<'online' | 'offline'>('offline')
const itemsPerPage = 14
const agendadorStore = useAgendadorStore()
const chamadosStore = useChamadosStore()
const { chamados} = storeToRefs(chamadosStore)
const { fetchChamados, selecionarChamado } = chamadosStore
// Ouvir o evento do backend sobre alteração do status
const socket = io(config.URL_BACKEND, {
  transports: ['websocket'],
  withCredentials: true
})
// Intervalo de refresh dos dados no frontend
let interval: ReturnType<typeof setInterval> | null = null
// Auto refresh da atualização dos chamados do Milvus para o Banco de Dados
const toggleAgendadorStatus  = async () => {
  statusBotaoAgendador.value = statusBotaoAgendador.value === 'online' ? 'offline' : 'online'
  await agendadorStore.toggleStatus(statusBotaoAgendador.value === 'online')
}


// Fetch
onMounted(async () => {
  await fetchChamados()
  await agendadorStore.fetchStatus()
  statusBotaoAgendador.value = agendadorStore.ativo ? 'online' : 'offline'
  socket.on('agendador:status', ({ ativo }) => {
    statusBotaoAgendador.value = ativo ? 'online' : 'offline'
    agendadorStore.ativo = ativo
  })
  interval = setInterval(() => {
    fetchChamados()
  }, 120000)

})

// Computed
const mesaTrabalho = computed(() =>
  tipoChamado.value === 'compra'
    ? 'Mesa Infra - Pedidos de Compra'
    : 'Mesa Infraestrutura'
)

// Computed
const chamadosFiltradosPorTipo = computed(() => {
  return chamados.value.filter(c =>
    c.mesa_trabalho?.trim().toLowerCase() === mesaTrabalho.value.trim().toLowerCase() &&
    !['FINALIZADO', 'FECHADO'].includes(c.status?.trim().toUpperCase())
  )
})

// Computed
const chamadosFiltrados = computed(() =>
  chamadosFiltradosPorTipo.value.filter(c =>
    Object.values(c).some(val =>
      String(val).toLowerCase().includes(search.value.toLowerCase())
    )
  )
)

const totalPages = computed(() =>
  Math.ceil(chamadosFiltrados.value.length / itemsPerPage)
)

const paginatedChamados = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return chamadosFiltrados.value.slice(start, start + itemsPerPage)
})

// Utils
const prioridadeClasse = (prioridade: string) => {
  const classes: Record<string, string> = {
    'Crítico': 'bg-red-100 text-red-700',
    'Alto': 'bg-orange-100 text-orange-600',
    'Médio': 'bg-yellow-100 text-yellow-500',
    'Baixo': 'bg-green-100 text-green-600',
    'Planejado': 'bg-sky-100 text-sky-600',
    'default': 'bg-gray-100 text-gray-500'
  }

  return classes[prioridade] || classes.default
}

onUnmounted(() => {
  socket.off('agendador:status')
  if (interval) clearInterval(interval)
})


</script>