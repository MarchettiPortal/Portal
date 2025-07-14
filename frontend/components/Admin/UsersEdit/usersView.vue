<template>
  <div class="p-6 space-y-6">
    <UsersHeader
  :tipoSelecionado="tipoSelecionado"
  :totalUsuarios="usuariosFiltrados.length"
  :totalUsuariosServico="usuariosServicoFiltrados.length"
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
import { ref, computed, onMounted } from 'vue'
import { useUsuariosStore } from '~/stores/Users/usuarios'
import { storeToRefs } from 'pinia'

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

const usuariosStore = useUsuariosStore()
const { usuarios } = storeToRefs(usuariosStore)
const { fetchUsuarios } = usuariosStore

onMounted(fetchUsuarios)

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

const usuarioSelecionado = ref<User>({
  id:        0,           // ou null/undefined se você marcar como opcional
  nome:      '',
  email:     '',
  setor:     '',
  licenca:   '',
  status:    '',
  grupos:    [],          // inicializa vazio
  permissoes: []          // inicializa vazio
})

// usuarios.value: User[]

const usuariosFiltrados = computed(() =>
  // aqui seu filtro de busca, que já tem predicate
  usuarios.value.filter(u =>
    u.nome.toLowerCase().includes(filtroBusca.value.toLowerCase()) ||
    u.email.toLowerCase().includes(filtroBusca.value.toLowerCase())
  )
)

const usuariosServicoFiltrados = computed(() =>
  // condição de “usuário de serviço” — substitua pela sua real
  usuarios.value.filter(u => u.tipo === 'servico')
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

function onSalvarEdicao(editedUser: any) {
    // TODO: actually update your store or send API request:
    // e.g. usuariosStore.updateUsuario(editedUser)
    console.log('Salvando edição de usuário', editedUser)
    modalEdicaoVisivel.value = false
 }

</script>