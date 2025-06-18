<template>
  <div v-if="show" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
    <div
      class="bg-white rounded-md shadow-xl w-full max-w-[1000px] max-h-[90vh] overflow-y-auto relative p-6 sm:p-8 animate-fade-in">

      <!-- Botão de fechar -->
      <button @click="emitClose"
        class="absolute top-4 right-4 text-gray-500 cursor-pointer hover:text-gray-800 transition-colors"
        aria-label="Fechar">
        <Icon icon="material-symbols:close" class="w-6 h-6" />
      </button>

      <!-- Abas de navegação -->
      <div class="flex justify-center mb-8 border-b pb-3 border-gray-200">
        <div class="inline-flex space-x-1 bg-gray-100 p-1 rounded-full">
          <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'px-4 py-2 text-sm font-medium cursor-pointer rounded-full transition-all duration-300',
              activeTab === tab
                ? 'bg-white text-gray-900 border border-gray-300'
                : 'text-gray-500 hover:text-gray-800'
            ]"
          >
            {{ tab }}
          </button>
        </div>
      </div>

      <!-- Conteúdo condicional com base na aba -->
      <div class="transition-all duration-300 min-h-[500px]">
        <div v-if="activeTab === 'AD'">
          <p class="text-gray-800 font-medium">{{ form.nome }}</p>
        </div>

        <!-- ABA Microsoft: lista de campos editáveis -->
        <div
          v-else-if="activeTab === 'Microsoft'"
          class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
        >
          <!-- Coluna Esquerda -->
          <div class="space-y-6">
            <!-- Nome -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input v-model="form.nome" type="text" placeholder="Digite o nome completo"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-gray-500 text-gray-800 placeholder:text-gray-400" />
            </div>

            <!-- E-mail -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input v-model="form.email" type="email" placeholder="Digite o e-mail"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-gray-500 text-gray-800 placeholder:text-gray-400" />
            </div>

            <!-- Setor -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Setor</label>
              <UDropdownMenu arrow :items="setores" :ui="{
                content: 'w-48 bg-white rounded-md border border-gray-200 shadow-sm',
                item: 'px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'
              }">
                <button
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none text-gray-700 transition">
                  {{ form.setor || 'Selecione um setor' }}
                </button>
              </UDropdownMenu>
            </div>
          </div>

          <!-- Coluna Direita -->
          <div class="space-y-6">
            <!-- Licença -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Licença</label>
              <input v-model="form.licenca" type="text" placeholder="Tipo de licença"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-gray-500 text-gray-800 placeholder:text-gray-400" />
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <UDropdownMenu arrow :items="statusOptions" :ui="{
                content: 'w-40 bg-white rounded-md border border-gray-200 shadow-sm',
                item: 'px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'
              }">
                <button
                  class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none text-gray-700 transition">
                  {{ form.status }}
                </button>
              </UDropdownMenu>
            </div>
          </div>
        </div>

        <!-- Outras abas... -->
        <div v-else-if="activeTab === 'Milvus'">
          <p class="text-gray-700">Configurações específicas do Milvus aqui.</p>
        </div>

        <div v-else-if="activeTab === 'Grupos'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label v-for="group in availableGroups" :key="group" class="flex items-center space-x-2">
            <input type="checkbox" :value="group" v-model="form.grupos" class="border-gray-300 rounded" />
            <span class="text-sm text-gray-700">{{ group }}</span>
          </label>
        </div>

        <div v-else-if="activeTab === 'Páginas'" class="space-y-6">
          <div v-for="(perms, groupName) in permissionsByGroup" :key="groupName">
            <h3 class="text-sm font-semibold text-gray-600 mb-2">{{ groupName }}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label v-for="perm in perms" :key="perm.rota" class="flex items-center space-x-2">
                <input type="checkbox" :value="perm.rota" v-model="form.permissoes" class="border-gray-300 rounded" />
                <span class="text-sm text-gray-700">{{ perm.nome }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Botões -->
      <div class="flex flex-col sm:flex-row justify-end sm:space-x-3 mt-10 space-y-3 sm:space-y-0">
        <button @click="emitClose"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition">Cancelar</button>
        <button @click="handleSave"
          class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition">Salvar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import type { DropdownMenuItem } from '@nuxt/ui'
import { usePermissionStore } from '@/stores/User/permissions'

// 1) Defina a prop `user` que vem do componente pai:
interface User {
  id: number
  nome: string
  email: string
  setor: string
  licenca: string
  status: string
  grupos: string[]
  permissoes: string[]
}

const props = defineProps<{
  show: boolean
  user: User
}>()

// 2) Defina o evento de salvar (`salvar`) e fechar (`close`)
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'salvar', payload: User): void
}>()

// 3) Estado local do formulário
const form = ref<User>({
  id: 0,
  nome: '',
  email: '',
  setor: '',
  licenca: '',
  status: '',
  grupos: [],
  permissoes: []
})

// 4) Sempre que `props.user` mudar, atualiza o form:
watch(() => props.user, user => {
  // faz um clone para manter reatividade separada
  form.value = { ...user }
}, { immediate: true })

// dropdowns e stores auxiliares…
const selectedSetor = ref('')
const setores = ref<DropdownMenuItem[]>([
  { label: 'Financeiro', click: () => (form.value.setor = 'Financeiro') },
  { label: 'Comercial',  click: () => (form.value.setor = 'Comercial') },
  { label: 'TI',         click: () => (form.value.setor = 'TI') },
  { label: 'Produção',    click: () => (form.value.setor = 'Produção') }
])

const statusOptions = ref<DropdownMenuItem[]>([
  { label: 'Ativo',   click: () => (form.value.status = 'ativo') },
  { label: 'Inativo', click: () => (form.value.status = 'inativo') }
])

const permStore = usePermissionStore()
onMounted(() => {
  permStore.permissoes.length === 0 && permStore.fetchPermissoes()
})

const availableGroups = computed(() => permStore.gruposDisponiveis())
const permissionsByGroup = computed(() => {
  const groups: Record<string, { rota: string; nome: string }[]> = {}
  permStore.permissoes.forEach(p => {
    if (!groups[p.grupo_pai]) groups[p.grupo_pai] = []
    groups[p.grupo_pai].push({ rota: p.rota, nome: p.nome_visivel })
  })
  return groups
})

// abas
const tabs = ['AD', 'Microsoft', 'Milvus', 'Grupos', 'Páginas']
const activeTab = ref('AD')

// ações
function emitClose() {
  emit('close')
}

function handleSave() {
  emit('salvar', { ...form.value })
}
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
