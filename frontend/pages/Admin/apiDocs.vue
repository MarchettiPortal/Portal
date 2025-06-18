<template>
  <div class="max-w-3xl mx-auto p-6 space-y-6 text-gray-800 bg-white rounded-xs shadow-md flex flex-col">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold flex items-center space-x-2">
        <iconify-icon icon="material-symbols:route-outline-sharp" width="28" inline></iconify-icon>
        <span>Documentação das APIs</span>
      </h1>
      <button
        @click="tab='api'; openModal = true"
        class="btn btn-danger"
      >
        + Adicionar
      </button>
    </div>

    <!-- Barra de busca e filtros -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
      <input
        v-model="search"
        type="text"
        placeholder="Buscar rota..."
        class="form-control flex-1"
      />
      <select v-model="methodFilter" class="form-select mt-2 sm:mt-0">
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
      :key="s.id"
      :id="s.id"
      :title="s.title"
      :routes="s.routes"
      :filter="search"
      :methodFilter="methodFilter"
      @delete-route="deleteApi"
      @delete-section="deleteSection"
    />


    <!-- Modal de Adicionar API -->
    <transition name="fade">
      <div
        v-if="openModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <div class="flex border-b mb-4 space-x-2">
            <button
              :class="tab==='api' ? activeTab : inactiveTab"
              @click="tab='api'"
            >
              Nova API
            </button>
            <button
              :class="tab==='section' ? activeTab : inactiveTab"
              @click="tab='section'"
            >
              Nova Seção
            </button>
          </div>

          <!-- Formulário para adicionar API -->
          <form v-if="tab==='api'" @submit.prevent="addApi" class="space-y-3">
            <div class="mb-3">
              <label class="form-label">Seção</label>
              <select v-model="apiForm.section" class="form-select">
                <option disabled value="">Selecione...</option>
                <option v-for="s in docs" :key="s.id" :value="s.title">{{ s.title }}</option>
                <option value="__new">+ Nova seção</option>
              </select>
            </div>
            <div v-if="apiForm.section==='__new'" class="mb-3">
              <label class="form-label">Nome da nova seção</label>
              <input
                v-model="apiForm.newSectionName"
                type="text"
                class="form-control"
                placeholder="Ex: Pagamentos"
                required
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Método</label>
              <select v-model="apiForm.method" required class="form-select">
                <option disabled value="">Selecione...</option>
                <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option><option>PATH</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">URL</label>
              <input
                v-model="apiForm.url"
                type="text"
                class="form-control"
                placeholder="/api/exemplo"
                required
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Descrição</label>
              <input
                v-model="apiForm.desc"
                type="text"
                class="form-control"
                placeholder="O que essa rota faz?"
                required
              />
            </div>
            <div class="d-flex justify-content-end gap-2 pt-2">
              <button type="button" @click="closeModal" class="btn btn-outline-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn btn-danger">
                Adicionar
              </button>
            </div>
          </form>

          <!-- Formulário para adicionar Seção -->
          <form v-else @submit.prevent="addSection" class="space-y-3">
            <div class="mb-3">
              <label class="form-label">Título da Seção</label>
              <input
                v-model="sectionForm.title"
                type="text"
                class="form-control"
                placeholder="Nova seção"
                required
              />
            </div>
            <div class="d-flex justify-content-end gap-2 pt-2">
              <button type="button" @click="closeModal" class="btn btn-outline-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn btn-danger">
                Salvar
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import ApiSection from '~/components/Admin/DocApi/ApiSection.vue'
import { config } from '~/config/global.config'

const activeTab = 'px-3 py-2 border-b-2 border-red-600 font-medium text-red-600'
const inactiveTab = 'px-3 py-2 text-gray-600'

interface RouteDoc { id?: number; method: string; url: string; desc: string }
interface SectionDoc { id: number; title: string; routes: RouteDoc[] }

definePageMeta({
  layout: 'adm-layout',
  middleware: ['permissao']
})

const docs = ref<SectionDoc[]>([])

async function fetchDocs() {
  try {
    const { data: sections } = await axios.get(`${config.API_BACKEND}/doc/listSections`)
    const all: SectionDoc[] = []
    for (const sec of sections) {
      const { data: routes } = await axios.get(`${config.API_BACKEND}/doc/listRoutes/${sec.id}`)
      all.push({
        id: sec.id,
        title: sec.title,
        routes: routes.map((r: any) => ({ id: r.id, method: r.method, url: r.url, desc: r.description }))
      })
    }
    docs.value = all
  } catch (err) {
    console.error('Erro ao carregar documentação:', err)
  }
}

onMounted(fetchDocs)

const search = ref('')
const methodFilter = ref('')

const openModal = ref(false)
const tab = ref<'api' | 'section'>('api')

const apiForm = ref({
  section: '' as string,
  newSectionName: '',
  method: '' as string,
  url: '' as string,
  desc: '' as string
})

const sectionForm = ref({
  title: ''
})

function resetForms() {
  apiForm.value = {
    section: '',
    newSectionName: '',
    method: '',
    url: '',
    desc: ''
  }
  sectionForm.value = { title: '' }
}

function closeModal() {
  openModal.value = false
  resetForms()
}

async function addApi() {
  let sectionTitle = apiForm.value.section
  let target: SectionDoc | undefined
  let sectionId: number | null = null
  if (sectionTitle === '__new') {
    sectionTitle = apiForm.value.newSectionName.trim()
    if (!sectionTitle) return
    try {
      const { data } = await axios.post(`${config.API_BACKEND}/doc/addSections`, {
        title: sectionTitle,
        display_order: docs.value.length + 1,
      })
      sectionId = data.id
      target = { id: data.id, title: sectionTitle, routes: [] }
      docs.value.push(target)
    } catch (err) {
      console.error('Erro ao criar seção:', err)
      return
    }
  } else {
    target = docs.value.find(s => s.title === sectionTitle)
    if (!target) return
    sectionId = target.id
  }

  try {
    const { data } = await axios.post(`${config.API_BACKEND}/doc/addRoutes`, {
      section_id: sectionId,
      method: apiForm.value.method,
      url: apiForm.value.url,
      description: apiForm.value.desc,
      display_order: target!.routes.length + 1,
    })
    target.routes.push({ id: data.id, method: data.method, url: data.url, desc: data.description })
    closeModal()
  } catch (err) {
    console.error('Erro ao adicionar API:', err)
  }
}

async function addSection() {
  const title = sectionForm.value.title.trim()
  if (!title) return
  try {
    const { data } = await axios.post(`${config.API_BACKEND}/doc/addSections`, {
      title,
      display_order: docs.value.length + 1,
    })
    docs.value.push({ id: data.id, title: data.title, routes: [] })
    closeModal()
  } catch (err) {
    console.error('Erro ao criar seção:', err)
  }
}

async function deleteApi(payload: { sectionId: number; route: RouteDoc }) {
  const sec = docs.value.find(s => s.id === payload.sectionId)
  if (!sec) return
  try {
    await axios.delete(`${config.API_BACKEND}/doc/deleteRoute/${payload.route.id}`)
    const idx = sec.routes.findIndex(r => r.id === payload.route.id)
    if (idx !== -1) sec.routes.splice(idx, 1)
  } catch (err) {
    console.error('Erro ao remover rota:', err)
  }
}

async function deleteSection(id: number) {
  const idx = docs.value.findIndex(s => s.id === id)
  if (idx === -1) return
  try {
    await axios.delete(`${config.API_BACKEND}/doc/deleteSections/${id}`)
    docs.value.splice(idx, 1)
  } catch (err) {
    console.error('Erro ao remover seção:', err)
  }
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