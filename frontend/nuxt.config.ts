import { defineNuxtConfig } from "nuxt/config";
import { config } from "../frontend/config/global.config";
import tailwindcss from "@tailwindcss/vite";


export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  css: ['@/assets/css/main.css'],
  modules: ['@nuxt/icon', '@pinia/nuxt', '@nuxt/ui',],
  plugins: ['~/plugins/socket.client.ts'],

  components: true,
  devServer: {
      host: '0.0.0.0',
      port: 3000
    },
    
  vite: {
    plugins: [
      tailwindcss(),
    ],
    server: {
      hmr: {
        protocol: 'wss',
        host: config.BACKEND_HOST,
        clientPort: 443,
      }
    },
  },

  ssr: false,
 
  nitro: {
    routeRules: {
      '/': { redirect: '/login' } // Redireciona a raiz para /login
    }
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