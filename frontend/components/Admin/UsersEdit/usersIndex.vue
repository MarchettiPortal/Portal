<template>
  <div class="p-4">
    <usersHeader
      :tipoSelecionado="tipoSelecionado"
      @trocarTipo="trocarTipo"
      @buscar="buscarUsuarios"
      @filtro="abrirFiltro"
      @adicionar="abrirModalAdicionar"
    />

    <usersTable :usuarios="usuariosFiltrados" @ver="verUsuario" />
  </div>
</template>

<script setup lang="ts">
import usersHeader from '@/components/Admin/UsersEdit/usersHeader.vue'
import usersTable from '@/components/Admin/UsersEdit/usersTable.vue'
import { ref, computed } from 'vue'

const tipoSelecionado = ref<'usuarios' | 'usuarios_servico'>('usuarios')
const usuarios = ref([
  { nome: 'João Silva', email: 'joao@email.com', setor: 'TI', licenca: 'Office 365', status: 'Ativo' },
  { nome: 'Maria Souza', email: 'maria@email.com', setor: 'RH', licenca: 'Office 365', status: 'Inativo' },
  // mais usuários...
])

const termoBusca = ref('')

const usuariosFiltrados = computed(() => {
  return usuarios.value.filter(u =>
    u.nome.toLowerCase().includes(termoBusca.value.toLowerCase()) ||
    u.email.toLowerCase().includes(termoBusca.value.toLowerCase())
  )
})

function trocarTipo(tipo: 'usuarios' | 'usuarios_servico') {
  tipoSelecionado.value = tipo
}

function buscarUsuarios(termo: string) {
  termoBusca.value = termo
}

function abrirFiltro() {
  // lógica para abrir modal ou drawer de filtro
}

function abrirModalAdicionar() {
  // lógica para abrir modal de adicionar usuário
}

function verUsuario(usuario: any) {
  // lógica para exibir detalhes do usuário
  console.log(usuario)
}
</script>
