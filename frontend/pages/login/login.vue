<template>
  <div
    class="relative flex items-center justify-center w-screen h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden"
  >
    <!-- Blobs animados no fundo -->
    <div
      class="absolute top-0 left-0 w-72 h-72 bg-red-600/20 rounded-xs blur-3xl animate-slow-pulse"
    ></div>
    <div
      class="absolute bottom-0 right-0 w-80 h-80 bg-red-600/20 rounded-full blur-3xl animate-slow-spin"
    ></div>

    <!-- Cartão principal -->
    <div
      class="relative z-10 max-w-sm w-full p-8 bg-white/10 backdrop-blur-xl border border-white/30 rounded-xs shadow-lg flex flex-col items-center space-y-6"
    >
      <!-- Logo + Tagline -->
      <img
        src="/Public/images/MarchettiLogo.png"
        alt="Logo Marchetti"
        class="w-60 h-auto"
      />
      <h2 class="text-white text-2xl font-semibold font-sans">
        Bem-vindo à Marchetti
      </h2>
      <p class="text-gray-300 text-base text-center leading-relaxed">
        Faça login para continuar
      </p>

      <!-- Botão de login -->
      <button
        @click="login"
        class="w-full flex items-center justify-center gap-3 py-3 font-medium rounded-xs bg-red-600 text-white shadow-md transform transition 
               hover:bg-red-700 focus:outline-none cursor-pointer focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        <img
          src="/icons/login-icon/microsoft-icon.svg"
          alt="Microsoft"
          class="w-5 h-5"
        />
        Entrar com Microsoft
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { config } from '~~/config/global.config'

const login = () => {
  window.location.href = config.AUTH_URL_BACKEND
}

definePageMeta({
  path: '/login',
})
</script>

<style scoped>
@keyframes slow-pulse {
  0%, 100% { transform: scale(1) }
  50% { transform: scale(1.1) }
}
@keyframes slow-spin {
  from { transform: rotate(0deg) }
  to   { transform: rotate(360deg) }
}
.animate-slow-pulse {
  animation: slow-pulse 8s ease-in-out infinite;
}
.animate-slow-spin {
  animation: slow-spin 20s linear infinite;
}
</style>
