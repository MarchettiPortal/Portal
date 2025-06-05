<template>
  <div class="grid grid-cols-[60%_40%] gap-4 p-4 h-full">
    <!-- Detalhes do chamado -->
    <div class="col-span-1 bg-white rounded-xs shadow-md p-4 overflow-y-auto">
      <DescricaoChamado />
      <ChamadoConversa class="mt-4" />
    </div>
    <!-- Tabela de chamados -->
    <div class="bg-white rounded-xs shadow-md p-4 flex flex-col overflow-auto">
      <ChamadoLista />
    </div>
  </div>
</template>
  
  <script setup lang="ts">
  import DescricaoChamado from '~/components/Admin/Chamados/ChamadoDetalhes.vue'
  import ChamadoLista from '~/components/Admin/Chamados/ChamadoLista.vue';
  import ChamadoConversa from '~/components/Admin/Chamados/ChamadoConversa.vue';

  definePageMeta({
  layout: "adm-layout",
  middleware: ['permissao'],

});
  
  </script>
  