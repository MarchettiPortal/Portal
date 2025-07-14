<template>
  <div class="border-r-2 h-full w-64 overflow-auto">
    <!-- cabeçalho -->
    <div>
      <span class="flex justify-center p-2 text-black">Documentação API's</span>
    </div>

    <!-- lista de seções -->
    <UCollapsible
      v-for="sec in sections"
      :key="sec.id"
      @open="loadRoutes(sec.id)"
      class="flex flex-col p-2 gap-2 w-full"
    >
      <div class="flex items-center gap-2">
        <!-- título + toggle -->
        <div
          class="flex justify-between items-center rounded-sm h-8 hover:bg-black/30 cursor-pointer transition-all duration-300 w-full px-2"
          @click="toggleSection(sec.id)"
        >
          <span class="text-black text-sm">{{ sec.title }}</span>
          <Icon
            name="material-symbols:keyboard-arrow-down-rounded"
            class="w-4 h-4 text-black"
          />
        </div>

        <!-- lixeira -->
        <div
          class="flex cursor-pointer hover:bg-red-300 items-center justify-center transition-all duration-300 rounded-sm w-10 h-8"
          @click.stop="askDeleteSection(sec)"
          aria-label="Excluir seção"
        >
          <Icon
            name="material-symbols:delete-outline-rounded"
            class="w-4 h-4 text-red-700"
          />
        </div>
      </div>

      <!-- conteúdo expandido -->
      <template #content>
        <ul>
          <li
            v-for="route in routesBySection[sec.id] || []"
            :key="route.id"
            class="px-4 py-1 text-sm text-gray-700"
          >
            {{ route.method }} — <code>{{ route.url }}</code>
          </li>
        </ul>

        <button
          @click="addRoute(sec.id, { method: 'Nova rota', url: '/nova', description: '' })"
          class="mt-2 text-xs text-red-600 hover:underline cursor-pointer"
        >
          + Adicionar rota
        </button>
      </template>
    </UCollapsible>

    <!-- botão de nova seção -->
    <button
      @click="askNewSection"
      class="mt-4 w-full text-sm text-center text-green-600 hover:underline cursor-pointer"
    >
      + Adicionar seção
    </button>
  </div>

  <!-- modal fora do flow da sidebar -->
  <teleport to="body">
    <ModalDeleteSection
      v-if="showDeleteModal"
      v-model="showDeleteModal"
      :title="sectionToDeleteTitle!"
      :id="sectionToDeleteId!"
      @confirm="handleDelete"
      @close="showDeleteModal = false"
    />
  </teleport>

  <teleport to="body">
    <ModalCreateSection
      v-model="showCreateModal"
      @confirm="title => addSection(title)"
    />
  </teleport>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '#components'
import { useDocAPI } from '~/composables/useDocAPI'
import type { Section } from '~/composables/useDocAPI'
import ModalDeleteSection from '~/components/Models/DocApi/ModalDeleteSection.vue'
import ModalCreateSection from '~/components/Models/DocApi/ModalCreateSection.vue'


const {
  sections,
  routesBySection,
  loadSections,
  addSection,
  loadRoutes,
  addRoute,
  deleteSection,
} = useDocAPI()




// estados do modal
const showDeleteModal = ref(false)
const sectionToDeleteId = ref<number|null>(null)
const sectionToDeleteTitle = ref<string|null>(null)

onMounted(() => loadSections())

function toggleSection(id: number) {
  loadRoutes(id)
}

// guarda id + title, abre o modal
function askDeleteSection(sec: Section) {
  sectionToDeleteId.value = sec.id
  sectionToDeleteTitle.value = sec.title
  showDeleteModal.value = true
}

// dispara a API de deleção usando o ID salvo
function handleDelete(id: number) {
  deleteSection(id)
  showDeleteModal.value = false
  sectionToDeleteId.value = null
  sectionToDeleteTitle.value = null
}

const showCreateModal = ref(false)

function askNewSection() {
  showCreateModal.value = true
}

</script>
