<template>
  <div class="p-4 text-black space-y-6">
    <h1 class="text-2xl font-bold">Documentação das APIs</h1>
    <section v-for="section in docs" :key="section.title" class="space-y-2">
      <h2 class="text-xl font-semibold">{{ section.title }}</h2>
      <ul class="list-disc list-inside ml-4 space-y-1">
        <li v-for="route in section.routes" :key="route.url">
          <code class="bg-gray-200 px-1 py-0.5 rounded text-sm">{{ route.method }} {{ route.url }}</code>
          - {{ route.desc }}
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
interface RouteDoc {
  method: string
  url: string
  desc: string
}

interface SectionDoc {
  title: string
  routes: RouteDoc[]
}

const docs: SectionDoc[] = [
  {
    title: 'Autenticação',
    routes: [
      { method: 'GET', url: '/auth/login', desc: 'Inicia o fluxo de login' },
      { method: 'GET', url: '/auth/redirect', desc: 'Callback de autenticação' },
      { method: 'POST', url: '/auth/logout', desc: 'Finaliza a sessão atual' },
      { method: 'GET', url: '/auth/me', desc: 'Dados da sessão ativa' },
      { method: 'GET', url: '/auth/user/photo', desc: 'Foto do usuário logado' }
    ]
  },
  {
    title: 'Chamados (Milvus)',
    routes: [
      { method: 'GET', url: '/api/milvus/chamados', desc: 'Lista todos os chamados' },
      { method: 'POST', url: '/api/milvus/chamados', desc: 'Cria um chamado' },
      { method: 'PUT', url: '/api/milvus/chamados/:codigo', desc: 'Atualiza um chamado' },
      { method: 'DELETE', url: '/api/milvus/chamados/:codigo', desc: 'Remove um chamado' }
    ]
  },
  {
    title: 'Office 365',
    routes: [
      { method: 'GET', url: '/api/graph/users', desc: 'Lista usuários do Microsoft 365' },
      { method: 'GET', url: '/api/graph/sync-teams-groups', desc: 'Sincroniza grupos do Teams' }
    ]
  },
  {
    title: 'Active Directory',
    routes: [
      { method: 'GET', url: '/api/ad/groups', desc: 'Lista grupos do AD' },
      { method: 'POST', url: '/api/ad/users', desc: 'Cria usuário no AD' },
      { method: 'GET', url: '/api/ad/status', desc: 'Verifica o status do serviço' }
    ]
  },
  {
    title: 'CLP e FTP',
    routes: [
      { method: 'GET', url: '/api/clp/status', desc: 'Retorna CLP em Execução' },
      { method: 'POST', url: '/api/clp/set', desc: 'Configura IP do CLP' },
      { method: 'POST', url: '/api/clp/upload', desc: 'Envia arquivo via FTP' },
      { method: 'GET', url: '/api/clp/health', desc: 'Status do serviço WPS remoto'},
    ]
  }
]

definePageMeta({
  layout: 'adm-layout',
  middleware: ['permissao']
})
</script>