<template>
  <section class="h-full w-full bg-white rounded-xs shadow-md flex flex-col p-6">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Painel esquerdo: Seleção e Exibição -->
      <div class="flex flex-col gap-6 w-full lg:w-2/6">
        <CLPSelecao />
        <CLPExibicao />
      </div>

      <!-- Painel direito: Importação -->
      <div class="w-full">
        <CLPImport />
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import CLPSelecao from '~/components/Users/EngenhariaP/CLP/CLPSelecao.vue'
import CLPImport from '~/components/Users/EngenhariaP/CLP/CLPImport.vue'
import CLPExibicao from '~/components/Users/EngenhariaP/CLP/CLPExibicao.vue'

definePageMeta({ layout: 'adm-layout' })
</script>
