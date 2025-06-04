import { defineNuxtConfig } from "nuxt/config";
import { config } from "../frontend/config/global.config";
import tailwindcss from "@tailwindcss/vite";


export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  css: ['@/assets/css/main.css'],
  modules: ['@nuxt/icon', '@pinia/nuxt', '@nuxt/ui',],
  
  components: true,

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  ssr: false,
 
  nitro: {
    routeRules: {
      '/': { redirect: '/login' } // Redireciona a raiz para /login
    }
  },
 
  devServer:{
    host: config.URL_FRONTEND, // Define o host
  },
 
    app: {
    head: {
      title: 'Marchetti Portal',
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.ico' } // ou .ico, .svg
      ]
    }
  }
})