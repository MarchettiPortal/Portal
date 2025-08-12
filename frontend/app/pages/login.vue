<template>
  <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr] h-screen">
    <!-- Lado da imagem -->
    <div class="relative h-full w-full overflow-hidden">
  <video autoplay muted loop playsinline class="w-full h-full object-cover">
  <source src="/videos/LoginVideo.mp4" type="video/mp4" />
</video>
  <div class="absolute inset-0 animated-gradient pointer-events-none mix-blend-screen opacity-30"></div>
</div>


    <!-- Lado do login -->
    <div class="login-bg-animated bg-pattern flex flex-col items-center justify-center px-6">
      <img src="/images/LoginLogo.png" class="w-[250px] md:w-[350px] max-w-full mb-10 relative z-10" />

      <div class="bg-white/20 backdrop-blur-md rounded shadow-xl w-full max-w-sm px-6 py-8 flex flex-col items-center gap-4 relative z-10">
        <span class="text-lg font-semibold text-gray-800">Bem-vindo à plataforma Marchetti</span>
        <span class="text-sm text-gray-600 text-center">Acesse com seu e-mail corporativo para continuar</span>

        <button
          @click="login"
          class="flex items-center justify-center text-white rounded px-5 py-2 bg-[#A71922] hover:bg-[#8d151d] transition-all w-full"
        >
          <Icon name="material-symbols:window-sharp" size="26" class="mr-3" />
          Entrar com Microsoft
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { config } from '~/config/global.config'


const login = () => {
  window.location.href = config.AUTH_URL_BACKEND
}

definePageMeta({
  layout: false 
})

</script>

<style scoped>
.bg-pattern {
  position: relative;
  overflow: hidden;
}

.bg-pattern::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    -45deg,
    rgba(0, 0, 0, 0.03),
    rgba(0, 0, 0, 0.03) 1px,
    transparent 1px,
    transparent 20px
  );
  z-index: 0;
  pointer-events: none;
}

.login-bg-animated {
  background: linear-gradient(-45deg, #f5f5f5, #e0e0e0, #ffffff);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}


</style>
