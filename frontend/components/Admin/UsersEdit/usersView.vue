<template>
  <div class="p-6 space-y-6">
    <UsersHeader
      :tipoSelecionado="tipoSelecionado"
      @trocarTipo="tipoSelecionado = $event"
      @buscar="onBuscar"
      @filtro="abrirFiltro"
      @adicionar="onAdicionarUsuario"
    />

    <UsersTable
      :usuarios="usuariosFiltrados"
      @ver="abrirModalVisualizacao"
      @editar="abrirModalEdicao"
    />

    <!-- Modal de visualização -->
    <UserModal
      :show="modalVisualizacaoVisivel"
      :user="usuarioSelecionado"
      @close="modalVisualizacaoVisivel = false"
    />

    <!-- Modal de edição -->
    <UsersEditModal
      :show="modalEdicaoVisivel"
      :user="usuarioSelecionado"
      @close="modalEdicaoVisivel = false"
      @salvar="onSalvarEdicao"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Componentes reutilizados
import UsersHeader from '@/components/Admin/UsersEdit/usersHeader.vue'
import UsersTable from '@/components/Admin/UsersEdit/usersTable.vue'
import UserModal from '@/components/Admin/UsersEdit/usersViewModal.vue'
import UsersEditModal from '@/components/Admin/UsersEdit/usersEditModal.vue'

// Estados
const tipoSelecionado = ref<'usuarios' | 'usuarios_servico'>('usuarios')
const filtroBusca = ref('')
const modalVisualizacaoVisivel = ref(false)
const modalEdicaoVisivel = ref(false)

const usuarios = ref([
  {
    nome: 'Eduardo Nitsche',
    email: 'eduardo.nitsche@molasmarchetti.com.br',
    setor: 'TI-Infra',
    licenca: 'Standard',
    status: 'Ativo'
  },
  {
    nome: 'Maria Souza',
    email: 'maria@email.com',
    setor: 'RH',
    licenca: 'Office 365',
    status: 'Inativo'
  }
])

const usuarioSelecionado = ref(usuarios.value[0])

// Computed para filtro
const usuariosFiltrados = computed(() =>
  usuarios.value.filter(u =>
    u.nome.toLowerCase().includes(filtroBusca.value.toLowerCase()) ||
    u.email.toLowerCase().includes(filtroBusca.value.toLowerCase())
  )
)

// Ações
function onBuscar(valor: string) {
  filtroBusca.value = valor
}

function abrirFiltro() {
  console.log('Abrir filtro')
}

function onAdicionarUsuario() {
  console.log('Adicionar usuário')
}

function abrirModalVisualizacao(usuario: any) {
  usuarioSelecionado.value = usuario
  modalVisualizacaoVisivel.value = true
}

function abrirModalEdicao(usuario: any) {
  usuarioSelecionado.value = usuario
  modalEdicaoVisivel.value = true
}

function onSalvarEdicao(usuarioEditado: any) {
  const index = usuarios.value.findIndex(u => u.email === usuarioEditado.email)
  if (index !== -1) {
    usuarios.value[index] = usuarioEditado
  }
  modalEdicaoVisivel.value = false
}
</script>
