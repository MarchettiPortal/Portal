<template>
  <div v-if="show" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-md shadow-md w-full max-w-md text-black relative">
      <h2 class="text-lg font-semibold mb-4">Enviar Descrição para o Log</h2>
      <textarea
        v-model="localDescricao"
        class="w-full border border-gray-300 rounded p-2 text-sm"
        rows="4"
        placeholder="Descreva o envio deste arquivo..."
      />
      <div class="flex justify-between mt-4">
            <button
  @click="onConfirm"
  :disabled="!isValid"
  class="px-4 py-2 rounded text-white
         bg-red-600 hover:bg-red-700
         disabled:bg-gray-300 disabled:cursor-not-allowed"
>
  Enviar
</button>
        <button
          @click="onCancel"
          class="px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
        >
          Cancelar
        </button>
      </div>
 
      <!-- Toast de aviso -->
      <transition name="fade">
        <div
          v-if="showNotify"
          class="fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded shadow-lg z-60"
        >
          Algum usuário já está enviando um arquivo, aguarde!
        </div>
      </transition>
    </div>
  </div>
</template>
 
<script setup lang="ts">
    import { ref, watch, computed } from 'vue'
    
    const props = defineProps<{
    show: boolean
    descricao: string
    disabled?: boolean
    }>()
    
    const emits = defineEmits<{
    (e: 'update:show', v: boolean): void
    (e: 'update:descricao', v: string): void
    (e: 'confirm'): void
    }>()
    
    const localDescricao = ref(props.descricao)
    watch(() => props.descricao, v => localDescricao.value = v)
    watch(localDescricao, v => emits('update:descricao', v))
    
    const isValid = computed(() => localDescricao.value.trim().length > 0)
    
    // controla exibição do toast
    const showNotify = ref(false)
    let notifyTimer: ReturnType<typeof setTimeout>
    
    // botão “Enviar” chama onConfirm
    function onConfirm() {
    if (!isValid.value) return;
    emits('confirm');
    }
    
    
    function onCancel() {
    emits('update:show', false)
    }
</script>
 
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
 