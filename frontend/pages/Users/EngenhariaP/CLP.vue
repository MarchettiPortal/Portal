<template>
  <div class="h-full w-full bg-white rounded-xs shadow-md grid-rows-[auto_1fr] grid p-6 gap-4 grid-cols-2">
    <div class="col-span-2"> 
    <CLPSelecao />
    </div>
    <CLPImport />
    <CLPExibicao />
  </div>


</template>

<script lang="ts" setup>
import CLPSelecao from '~/components/Users/EngenhariaP/CLP/CLPSelecao.vue'
import CLPImport from '~/components/Users/EngenhariaP/CLP/CLPImport.vue'
import CLPExibicao from '~/components/Users/EngenhariaP/CLP/CLPUpload.vue'

definePageMeta({
  layout: "adm-layout",
  middleware: ['permissao']
});
</script>
