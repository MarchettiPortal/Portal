<template>
  <div v-if="chamadoSelecionado" class="grid grid-cols-[70%_30%] gap-2">
    <!-- Parte esquerda: descrição -->
    <div class="flex flex-col gap-1 px-2 border-t-2 rounded-tr-xl border-red-500">
      <div class="mt-5">
        <label class="font-bold text-lg">#{{ chamadoSelecionado.codigo }} -</label>
        <label class="font-bold text-lg">{{ chamadoSelecionado.assunto }}</label>
      </div>
      <label class="whitespace-pre-line">
        {{ chamadoSelecionado.descricao }}
      </label>
    </div>

    <!-- Parte direita: dados do cliente e detalhes -->
    <div class="flex flex-col border-t-2 text-end px-2 rounded-tl-xl border-red-500">
      <label class="font-bold text-lg mt-5">{{ chamadoSelecionado.usuario_chamado || 'Não Possui' }}</label>
      <label class="font-bold">{{ chamadoSelecionado.setor || 'Não Possui'}}</label>

      <!-- Informações detalhadas -->
      <div class="flex p-2 gap-1 items-start flex-col border-b-2 rounded-bl-xl border-red-500 mt-10">
        <label><span class="font-bold">Operador:</span> {{ chamadoSelecionado.nome_operador || 'Não Possui' }}</label>
        <label><span class="font-bold">Local:</span> {{ chamadoSelecionado.local || 'Não Possui'}}</label>
        <label><span class="font-bold">Categoria:</span> {{ chamadoSelecionado.categoria || 'Não Possui' }}</label>
        <label><span class="font-bold">Prioridade:</span> {{ chamadoSelecionado.prioridade || 'Não Possui'}}</label>
        <label><span class="font-bold">Atendimento:</span> {{ chamadoSelecionado.tipo_atendimento || 'Não Possui'}}</label>
        <label>
          <span class="font-bold">Data Abertura:</span>
          {{ chamadoSelecionado.data_criacao ? new Date(chamadoSelecionado.data_criacao).toLocaleDateString('pt-BR') : 'Não Possui' }}
        </label>
      </div>
    </div>
  </div>

  <div v-else class="text-center text-gray-500 p-4 col-span-2">
    Nenhum chamado selecionado.
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useChamadosStore } from '~/stores/Milvus/chamados'

const chamadosStore = useChamadosStore()
const { chamadoSelecionado } = storeToRefs(chamadosStore)
</script>
