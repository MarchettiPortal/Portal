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
  @ver="abrirModal"
  @editar="abrirModalEdicao"
/>

    <!-- Modal de visualização -->
    <UserModal
      :show="modalVisivel"
      :user="usuarioSelecionado"
      @close="modalVisivel = false"
    />

    <!-- Modal de edição -->
    <usersEditModal
      :show="modalEdicaoVisivel"
      :user="usuarioSelecionado"
      @close="modalEdicaoVisivel = false"
      @salvar="onSalvarEdicao"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import UsersHeader from './usersHeader.vue'
import UsersTable from './usersTable.vue'
import UserModal from './usersViewModal.vue'
import usersEditModal from './usersEditModal.vue'

const tipoSelecionado = ref<'usuarios' | 'usuarios_servico'>('usuarios')
const filtroBusca = ref('')
const modalVisivel = ref(false)
const modalEdicaoVisivel = ref(false) // estado para modal de edição

const usuarios = ref([
  {
    nome: 'Eduardo Nitsche',
    email: 'eduardo.nitsche@molasmarchetti.com.br',
    setor: 'TI-Infra',
    licenca: 'Standart',
    status: 'Ativo'
  }
])

const usuarioSelecionado = ref(usuarios.value[0])

const usuariosFiltrados = computed(() =>
  usuarios.value.filter(u =>
    u.nome.toLowerCase().includes(filtroBusca.value.toLowerCase())
  )
)

function abrirModal(usuario: any) {
  usuarioSelecionado.value = usuario
  modalVisivel.value = true
}

function abrirModalEdicao(usuario: any) {
  usuarioSelecionado.value = usuario
  modalEdicaoVisivel.value = true
}

function onBuscar(valor: string) {
  filtroBusca.value = valor
}

function abrirFiltro() {
  console.log('Filtro clicado')
}

function onAdicionarUsuario() {
  console.log('Adicionar usuário')
}

function onSalvarEdicao(usuarioEditado: any) {
  // Atualiza a lista de usuários com os dados editados
  const index = usuarios.value.findIndex(u => u.email === usuarioEditado.email)
  if (index !== -1) {
    usuarios.value[index] = usuarioEditado
  }
  modalEdicaoVisivel.value = false
}
</script>
