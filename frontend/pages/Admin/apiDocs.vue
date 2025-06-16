<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6 text-gray-800 bg-white rounded-xs shadow-md flex flex-col">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold flex items-center space-x-2">
        <iconify-icon icon="material-symbols:route-outline-sharp" width="28" inline></iconify-icon>
        <span>Documentação das APIs</span>
      </h1>
      <button
        @click="openModal = true"
        class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer transition"
      >
        + Adicionar API
      </button>
    </div>

    <!-- Barra de busca e filtros -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
      <input
        v-model="search"
        type="text"
        placeholder="Buscar rota..."
        class="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
      />
      <select v-model="methodFilter" class="border border-gray-300 rounded px-3 py-2 focus:outline-none">
        <option value="">Todos métodos</option>
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
        <option value="PATH">PATH</option>
      </select>
    </div>

    <!-- Seções -->
    <ApiSection
  v-for="s in docs"
  :key="s.title"
  :title="s.title"
  :routes="s.routes"
  :filter="search"
  :methodFilter="methodFilter"
  @delete-route="deleteApi"
/>


    <!-- Modal de Adicionar API -->
    <transition name="fade">
      <div
        v-if="openModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <h2 class="text-xl font-semibold mb-4">Adicionar nova API</h2>
          <form @submit.prevent="addApi">
            <!-- Escolher seção existente ou criar nova -->
            <label class="block mb-2">
              <span class="text-sm font-medium">Seção</span>
              <select v-model="form.section" class="mt-1 block w-full border-gray-300 rounded">
                <option disabled value="">Selecione...</option>
                <option v-for="s in docs" :key="s.title" :value="s.title">{{ s.title }}</option>
                <option value="__new">+ Nova seção</option>
              </select>
            </label>
            <label v-if="form.section==='__new'" class="block mb-2">
              <span class="text-sm font-medium">Nome da nova seção</span>
              <input
                v-model="form.newSectionName"
                type="text"
                class="mt-1 block w-full border-gray-300 rounded"
                placeholder="Ex: Pagamentos"
                required
              />
            </label>

            <!-- Campos da rota -->
            <label class="block mb-2">
              <span class="text-sm font-medium">Método</span>
              <select v-model="form.method" required class="mt-1 block w-full border-gray-300 rounded">
                <option disabled value="">Selecione...</option>
                <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option><option>PATH</option>
              </select>
            </label>
            <label class="block mb-2">
              <span class="text-sm font-medium">URL</span>
              <input
                v-model="form.url"
                type="text"
                class="mt-1 block w-full border-gray-300 rounded"
                placeholder="/api/exemplo"
                required
              />
            </label>
            <label class="block mb-4">
              <span class="text-sm font-medium">Descrição</span>
              <input
                v-model="form.desc"
                type="text"
                class="mt-1 block w-full border-gray-300 rounded"
                placeholder="O que essa rota faz?"
                required
              />
            </label>

            <!-- Ações -->
            <div class="flex justify-end space-x-2">
              <button
                type="button"
                @click="openModal = false; resetForm()"
                class="px-4 py-2 rounded border border-gray-300 cursor-pointer hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="bg-red-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-700"
              >
                Adicionar
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ApiSection from '~/components/Admin/DocApi/ApiSection.vue'

interface RouteDoc { method: string; url: string; desc: string }
interface SectionDoc { title: string; routes: RouteDoc[] }

definePageMeta({
  layout: 'adm-layout',
  middleware: ['permissao']
})

const docs = ref<SectionDoc[]>([
  {
    title: 'Autenticação',
    routes: [
      { method: 'GET',  url: '/auth/login',      desc: 'Inicia o fluxo de login' },
      { method: 'GET',  url: '/auth/redirect',   desc: 'Callback de autenticação' },
      { method: 'POST', url: '/auth/logout',     desc: 'Finaliza a sessão atual' },
      { method: 'GET',  url: '/auth/me',         desc: 'Dados da sessão ativa' },
      { method: 'GET',  url: '/auth/user/photo', desc: 'Foto do usuário logado' }
    ]
  },
  {
    title: 'Chamados (Milvus)',
    routes: [
      { method: 'GET',    url: '/api/milvus/chamados',         desc: 'Lista todos os chamados' },
      { method: 'POST',   url: '/api/milvus/chamados',         desc: 'Cria um chamado' },
      { method: 'PUT',    url: '/api/milvus/chamados/:codigo', desc: 'Atualiza um chamado' },
      { method: 'DELETE', url: '/api/milvus/chamados/:codigo', desc: 'Remove um chamado' }
    ]
  },
  {
    title: 'Office 365',
    routes: [
      { method: 'GET', url: '/api/graph/users',             desc: 'Lista usuários do Microsoft 365' },
      { method: 'GET', url: '/api/graph/sync-teams-groups', desc: 'Sincroniza grupos do Teams' }
    ]
  },
  {
    title: 'Active Directory',
    routes: [
      { method: 'GET',  url: '/api/ad/groups', desc: 'Lista grupos do AD' },
      { method: 'POST', url: '/api/ad/users',  desc: 'Cria usuário no AD' },
      { method: 'GET',  url: '/api/ad/status', desc: 'Verifica o status do serviço' }
    ]
  },
  {
    title: 'CLP e FTP',
    routes: [
      { method: 'GET',  url: '/api/clp/status', desc: 'Retorna CLP em Execução' },
      { method: 'POST', url: '/api/clp/set',    desc: 'Configura IP do CLP' },
      { method: 'POST', url: '/api/clp/upload', desc: 'Envia arquivo via FTP' },
      { method: 'GET',  url: '/api/clp/health', desc: 'Status do serviço CLP/WPS' }
    ]
  }
])

const search = ref('')
const methodFilter = ref('')

const openModal = ref(false)
const form = ref({
  section: '' as string,
  newSectionName: '',
  method: '' as string,
  url: '' as string,
  desc: '' as string
})

function resetForm() {
  form.value = {
    section: '',
    newSectionName: '',
    method: '',
    url: '',
    desc: ''
  }
}

function addApi() {
  let sectionTitle = form.value.section
  if (sectionTitle === '__new') {
    sectionTitle = form.value.newSectionName.trim()
    if (!sectionTitle) return
    docs.value.push({ title: sectionTitle, routes: [] })
  }
  const section = docs.value.find(s => s.title === sectionTitle)
  if (!section) return
  section.routes.push({
    method: form.value.method,
    url: form.value.url,
    desc: form.value.desc
  })
  openModal.value = false
  resetForm()
}

function deleteApi(payload: { section: string; route: RouteDoc }) {
  const sec = docs.value.find(s => s.title === payload.section)
  if (!sec) return
  const idx = sec.routes.findIndex(r =>
    r.method === payload.route.method && r.url === payload.route.url
  )
  if (idx !== -1) sec.routes.splice(idx, 1)
}

</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
