import { io, Socket } from 'socket.io-client'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useClpStore } from '~/stores/CLP/useClpStore'
import { config } from '~/config/global.config'
import { watch } from 'vue'

export default defineNuxtPlugin(() => {
  // conecta ao mesmo host de API + socket
  const socket = io(config.URL_BACKEND, {
    path: '/socket.io',
    autoConnect: false,
    transports: ['websocket']
  }) as Socket

  const clpStore = useClpStore()

  // sempre que o CLP mudar na store, (re)conecta e entra na sala
 // quando clpText mudar, conecta e entra na sala certa
  watch(() => clpStore.clpText, clp => {
    if (!clp) return
    if (!socket.connected) socket.connect()
    socket.emit('join-clp', { clp })
  }, { immediate: true })

  socket.on('connect', () => {
    if (clpStore.clpText) {
      socket.emit('join-clp', { clp: clpStore.clpText })
    }
  })

// sempre que o backend emitir qualquer um destes eventos,
  // forçamos atualização via store
  socket.on('ftp-upload-completo', () => clpStore.atualizarCLPAtual())
  socket.on('arquivo-renomeado',       () => clpStore.atualizarCLPAtual())
  socket.on('arquivo-excluido',        () => clpStore.atualizarCLPAtual())
  socket.on('clp-trocado', ({ clp }) => {
    clpStore.clpText = clp
    clpStore.atualizarCLPAtual()
  })
  // ... eventos CLP existentes
  socket.on('ftp-started', () => {
    clpStore.setFtpStatus('iniciando')
  })

  socket.on('ftp-finished', () => {
    clpStore.setFtpStatus('concluído')
  })

  socket.on('ftp-error', (data) => {
    console.error('Erro no upload FTP:', data.log)
    clpStore.setFtpStatus('erro')
  })


  return {
    provide: {
      socket
    }
  }
})