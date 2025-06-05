<template>
    <div class="h-full w-full bg-white rounded-xs shadow-md flex flex-col p-4">

        <div class="">
            <ProcedimentoSelect/>
        </div>
        <!-- Sistemas -->
        <div class="">
            <!--<ProcedimentoCard />-->
        </div>

    </div>
</template>

<script setup lang="ts">
import ProcedimentoCard from '~~/components/Admin/Procedimentos/ProcedimentoCard.vue'
import ProcedimentoSelect from '~~/components/admin/procedimentos/ProcedimentoSelect.vue'

const showPopup = ref(false);


definePageMeta({
  layout: "adm-layout",
  middleware: ['permissao']
});

</script>