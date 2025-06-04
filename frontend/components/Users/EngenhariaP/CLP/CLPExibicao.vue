<template>
    <div class="p-4 w-full h-full text-black bg-gray-200">
        <div>
            <p class="text-xl"><strong>Receita em execução:</strong></p>
        </div>
        <div class="mt-4 p-2">
            <p><strong>Último Arquivo Enviado: </strong>{{ nomeArquivo }}</p>
            <p><strong>Tamanho: </strong> {{ tamanho }}</p>
            <p><strong>Descrição: </strong> {{ descricao }} </p>
            <p><strong>Data de Modificação: </strong> {{ data }}</p>
            <p><strong>Hora de Modificação: </strong> {{ hora }}</p>
            <p><strong>Colaborador: </strong> {{ usuario }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useClpStore } from '~/stores/CLP/useClpStore'
    import { useUltimoLog } from '~/composables/useUltimoLog'
    import { onMounted, onBeforeUnmount, watch } from 'vue'
    import  eventBus  from '~/utils/eventBus'
    import { storeToRefs } from 'pinia'

    // Acesso ao CLP atual da store
    const clpStore = useClpStore()
    const { clpText } = storeToRefs(clpStore)

    // Hook reutilizável que fornece as variáveis reativas e a função de busca
    const {
    nomeArquivo,
    data,
    hora,
    tamanho,
    usuario,
    descricao,
    buscarUltimoLog
    } = useUltimoLog()

    // Atualiza os dados ao montar a página (caso o CLP já esteja setado)
    onMounted(() => {
    if (clpText.value) buscarUltimoLog(clpText.value)

    // ✅ Escuta o evento
    eventBus.on('log-atualizado', () => {
        if (clpText.value) buscarUltimoLog(clpText.value)
    })
    })

    onBeforeUnmount(() => {
        eventBus.off('log-atualizado')
    })

    // Atualiza sempre que o CLP mudar
    watch(() => clpText.value, (novoClp) => {
    if (novoClp) buscarUltimoLog(novoClp)
    })

</script>