<template>
  <div v-if="show" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
    <div
      class="bg-white rounded-md shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative p-8 animate-fade-in">
      <!-- Botão de fechar -->
      <button @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-500 cursor-pointer hover:text-gray-800 transition-colors"
        aria-label="Fechar">
        <Icon icon="material-symbols:close" class="w-6 h-6" />
      </button>

      <!-- Abas de navegação -->
      <div class="flex justify-center mb-8 border-b pb-3 border-gray-200">
        <div class="inline-flex space-x-1 bg-gray-100 p-1 rounded-full">
          <button v-for="tab in tabs" :key="tab" @click="activeTab = tab" :class="[
            'px-4 py-2 text-sm font-medium cursor-pointer rounded-full transition-all duration-300',
            activeTab === tab
              ? 'bg-white text-gray-900 border border-gray-300'
              : 'text-gray-500 hover:text-gray-800'
          ]">
            {{ tab }}
          </button>
        </div>
      </div>

      <!-- Conteúdo condicional com base na aba -->
      <div>
        <div v-if="activeTab === 'AD'">
          <p class="text-gray-800 font-medium">Eduardo Nitsche</p>
        </div>

        <div v-else-if="activeTab === 'Microsoft'" class="grid grid-cols-2 gap-8">
          <!-- Coluna Esquerda: Campos -->
          <div class="space-y-6">
            <!-- Nome -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input v-model="form.nome" type="text" placeholder="Digite o nome completo"
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
                  {{ selectedSetor || 'Selecione um setor' }}
                </button>
              </UDropdownMenu>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select v-model="form.status"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:border-gray-500 text-gray-700">
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input v-model="form.email" type="email" placeholder="email@empresa.com.br"
                class="w-full px-3 py-2 border border-gray-300 rounded-md placeholder:text-gray-400 shadow-sm focus:outline-none focus:border-gray-500 text-gray-800" />
            </div>

            <!-- Licença -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Licença</label>
              <UDropdownMenu arrow :items="dropItems" :ui="{
                content: 'w-48 bg-white border border-gray-200 rounded-md shadow-sm',
                item: 'px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'
              }">
                <button class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left text-gray-700">
                  {{ selectedPermissao || 'Selecione' }}
                </button>
              </UDropdownMenu>
            </div>
          </div>

          <!-- Coluna Direita: Espaço reservado -->
          <div
            class="rounded-lg h-full p-4 flex items-center justify-center text-gray-400">
            <span></span>
          </div>
        </div>

        <div v-else-if="activeTab === 'Milvus'">
          <p class="text-gray-700">Configurações específicas do Milvus aqui.</p>
        </div>
      </div>

      <!-- Botões de ação -->
      <div class="flex justify-end space-x-3 mt-10">
        <button @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition">Cancelar</button>
        <button @click="handleSave"
          class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition">Salvar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { Icon } from '@iconify/vue'
import type { DropdownMenuItem } from '@nuxt/ui'

const form = ref({
  nome: 'Eduardo Nitsche da Rosa',
  setor: '',
  status: 'ativo',
  email: ''
})

const selectedSetor = ref('TI') // já selecionado inicialmente

const setores = ref<DropdownMenuItem[]>([
  {
    label: 'Financeiro',
    click: () => selectedSetor.value = 'Financeiro'
  },
  {
    label: 'Comercial',
    click: () => selectedSetor.value = 'Comercial'
  },
  {
    label: 'TI',
    click: () => selectedSetor.value = 'TI'
  },
  {
    label: 'Produção',
    click: () => selectedSetor.value = 'Produção'
  }
])

const selectedPermissao = ref('')
const dropItems = ref<DropdownMenuItem[]>([
  {
    label: 'Standard',
    click: () => selectedPermissao.value = 'Standard'
  },
  {
    label: 'Basic',
    click: () => selectedPermissao.value = 'Basic'
  }
])

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
}>()

const tabs = ['AD', 'Microsoft', 'Milvus']
const activeTab = ref('AD')

function handleSave() {
  emit('save')
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
