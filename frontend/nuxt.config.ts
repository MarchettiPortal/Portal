// https://nuxt.com/docs/api/configuration/nuxt-config
import { config } from "./app/config/global.config";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss', '@nuxt/icon', '@pinia/nuxt'],


  nitro: {
    routeRules: {
      '/': { redirect: '/login' } // Redireciona a raiz para /login
    }
  },
  
  devServer: {
      host: '0.0.0.0',
      port: 3000
    },

   vite: {
    server: {
      hmr: {
        protocol: 'wss',
        host: config.BACKEND_HOST,
        clientPort: 443,
      }
    },
  },
})