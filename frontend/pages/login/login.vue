<template>
  <div class="relative w-screen h-screen bg-neutral-950 flex items-center justify-center">
    <!-- Imagem de fundo com sombra -->
    <div class="absolute w-[85%] h-[95%] rounded shadow-2xl shadow-red-500/40 border border-red-500/20 overflow-hidden">
      <img src="/images/fundologin.png" alt="Imagem decorativa" class="w-full h-full object-cover" />
    </div>

    <!-- Card com efeito glassmorphism -->
    <div
      class="z-10 w-80 max-w-full p-6 md:p-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-md shadow-lg flex flex-col items-center space-y-6">
      <button @click="login"
        class="w-full flex items-center justify-center gap-3 bg-white/10 text-white border border-white/20 px-5 py-3 rounded-md font-medium text-sm tracking-wide hover:bg-white/20 transition duration-200">
        <img src="/icons/login-icon/microsoft-icon.svg" alt="Microsoft" class="w-5 h-5" />
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
