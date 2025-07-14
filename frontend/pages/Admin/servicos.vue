<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 overflow-y-auto h-[600px]">
    <StatusCard
      v-for="svc in services"
      :key="svc.key"
      :label="svc.label"
      :status="svc.status"
      :loading="svc.loading"
      @restart="onRefresh(svc.key)"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import StatusCard from '~/components/Admin/Servicos/ServicosCard.vue'
import { config } from '~/config/global.config'

definePageMeta({
  layout: 'adm-layout',
  middleware: ['permissao']
})

type ServiceStatus = 'up' | 'down'
interface Service {
  key: string
  label: string
  status: ServiceStatus
  loading: boolean
}

const services = reactive<Service[]>([
  { key: 'wps-ftp',      label: 'Status WPS/FTP',     status: 'down', loading: false },
  { key: 'remote-clp',   label: 'Serviço remoto CLP', status: 'down', loading: false },
  { key: 'wps-weg',      label: 'SV-WPS-WEG',         status: 'down', loading: false },
  { key: 'intranet-sql', label: 'SV-Intranet-SQL',    status: 'down', loading: false },
  { key: 'postgresql',   label: 'Status PostgreSQL',  status: 'down', loading: false },
  { key: 'nginx',        label: 'Status NGINX',       status: 'down', loading: false },
])

// Endpoints de status
const serviceEndpoints: Record<string, string> = {
  'wps-ftp':      `${config.API_BACKEND}/status/appwps`,
  'remote-clp':   `${config.API_BACKEND}/status/remotewps`,
  'wps-weg':      `${config.API_BACKEND}/status/serverwps`,
  'intranet-sql': `${config.API_BACKEND}/status/serversql`,
  'postgresql':   `${config.API_BACKEND}/status/postgresql`,
  'nginx':        `${config.API_BACKEND}/status/nginx`,
}

async function fetchAllStatuses() {
  await Promise.all(
    services.map(async svc => {
      const endpoint = serviceEndpoints[svc.key]
      if (!endpoint) {
        svc.status = 'down'
        return
      }

      svc.loading = true
      try {
        const res = await fetch(endpoint)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json() as { status: string }
        // trata "ok" e "up" como positivos
        svc.status = (data.status === 'ok' || data.status === 'up') ? 'up' : 'down'
      } catch (err) {
        console.error(`Erro ao checar ${svc.key}:`, err)
        svc.status = 'down'
      } finally {
        svc.loading = false
      }
    })
  )
}

async function onRefresh(key: string) {
  const svc = services.find(s => s.key === key)
  if (!svc) return

  const refreshUrl = `${config.API_BACKEND}/status/${key}/refresh`
  svc.loading = true

  try {
    const res = await fetch(refreshUrl, { method: 'POST' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    // após refresh, atualiza todos os status
    await fetchAllStatuses()
  } catch (err) {
    console.error(`Erro ao dar refresh em ${key}:`, err)
  } finally {
    svc.loading = false
  }
}

onMounted(() => {
  fetchAllStatuses()
  setInterval(fetchAllStatuses, 10000) // atualiza a cada 10s
})
</script>
