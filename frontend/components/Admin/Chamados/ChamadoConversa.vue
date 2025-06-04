<template>
    <div class="flex flex-col h-80 border-t-2 border-red-500 rounded-lg">
      <!-- Área de mensagens -->
      <div
        class="flex-1 overflow-y-auto p-4 bg-gray-50 rounded-lg shadow-sm space-y-4 custom-scrollbar"
        ref="chatArea"
      >
        <!-- Mensagens exibidas em ordem cronológica -->
        <div
  v-for="(msg, index) in messages"
  :key="index"
  :class="messageContainerClass(msg.sender)"
>
  <div class="flex flex-col items-end max-w-[50%] w-fit">
    <div
    class="flex flex-col"
    :class="msg.sender === 'Eduardo Nitsche' ? 'items-end' : 'items-start'"
  >
    <!-- Nome do remetente -->
    <span
      class="font-semibold text-sm text-gray-600 mb-1"
      :class="msg.sender === 'Eduardo Nitsche' ? 'text-right' : 'text-left'"
    >
      {{ msg.sender }}
    </span>
    <!-- Mensagem -->
    <div
      :class="[msg.sender === 'Eduardo Nitsche' ? 'bg-red-500 text-white' : 'bg-gray-200',
        'p-2 py-1 rounded-xs shadow-sm break-words w-fit max-w-full'
      ]"
    >
      <p class="whitespace-pre-wrap">{{ msg.text }}</p>
    </div>
  </div>
  </div>
</div>
</div>
  
      <!-- Caixa de entrada e botão -->
      <div class="p-4 bg-white shadow-md rounded-b-lg flex items-center space-x-2">
        <input
          v-model="newMessage"
          @keydown.enter="sendMessage"
          type="text"
          class="w-full p-2 rounded-xs border border-gray-300 focus:outline-none focus:ring-red-500"
          placeholder="Digite sua mensagem..."
        />
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim()"
          class="p-2 bg-red-500 text-white rounded-xs hover:bg-red-600 disabled:bg-gray-300"
        >
          Enviar
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, nextTick, watch } from 'vue';
  
  interface Message {
    sender: string;
    text: string;
  }
  
  const messages = ref<Message[]>([
    { sender: 'Alceu Whitoeft', text: 'Oi, preciso de ajuda.' },
    { sender: 'Eduardo Nitsche', text: 'Claro, em que posso te ajudar?' }
  ]);
  
  const newMessage = ref('');
  const chatArea = ref<HTMLElement | null>(null);
  
  const sendMessage = () => {
    if (newMessage.value.trim()) {
      messages.value.push({ sender: 'Eduardo Nitsche', text: newMessage.value });
      newMessage.value = '';
    }
  };
  
  // Scroll para a última mensagem quando adicionar nova
  watch(
    () => messages.value.length,
    () => {
      nextTick(() => {
        if (chatArea.value) {
          chatArea.value.scrollTop = chatArea.value.scrollHeight;
        }
      });
    }
  );
  
  const messageContainerClass = (sender: string) =>
    sender === 'Eduardo Nitsche' ? 'flex justify-end' : 'flex justify-start';
  
  const messageSenderClass = (sender: string) =>
    sender === 'Eduardo Nitsche'
      ? 'text-right font-semibold text-sm text-gray-600 mb-1'
      : 'text-left font-semibold text-sm text-gray-600 mb-1';
  
  const messageContentClass = (sender: string) =>
    `${sender === 'Eduardo Nitsche' ? 'bg-red-500 text-white' : 'bg-gray-200'} p-2 rounded-lg shadow-sm break-words`;
  </script>
  
  <style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #db2828;
    border-radius: 10px;
    transition: background 0.3s ease;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9e0404;
  }
  </style>
  