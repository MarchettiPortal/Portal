<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 my-scrollable overflow-y-auto h-[600px]">
    <StatusCard
      v-for="svc in services"
      :key="svc.key"
      :label="svc.label"
      :status="svc.status"
      @restart="onRestart(svc.key)"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import StatusCard from '~/components/Admin/Servicos/ServicosCard.vue'
import permissao from '~/middleware/permissao';
import { config } from '~/config/global.config';

definePageMeta({
    layout: 'adm-layout',
    middleware: ['permissao']
})

type ServiceStatus = 'up' | 'down'
interface Service { key: string; label: string; status: ServiceStatus }

const services = reactive<Service[]>([
  { key: 'wps-ftp',      label: 'Status WPS/FTP',     status: 'down'   },
  { key: 'remote-clp',   label: 'Serviço remoto CLP', status: 'down' }, //unico configurado
  { key: 'wps-weg',      label: 'SV-WPS-WEG',         status: 'down' },
  { key: 'intranet-sql', label: 'SV-Intranet-SQL',    status: 'down'   },
  { key: 'postgresql',   label: 'Status PostgreSQL',  status: 'down'   },
  { key: 'nginx',        label: 'Status NGINX',       status: 'down' },
])

const serviceEndpoints: Record<string,string> = {
  'wps-ftp': `${config.API_BACKEND}/`,
  'remote-clp': `${config.API_BACKEND}/status/remotewps`,
  'wps-weg': `${config.API_BACKEND}/status/serverwps`,
  'intranet-sql': `${config.API_BACKEND}/`,
  'postgresql': `${config.API_BACKEND}/`,
  'nginx': `${config.API_BACKEND}/`,
}

async function fetchAllStatuses() {
  await Promise.all(
    services.map(async svc => {
      const url = serviceEndpoints[svc.key]
      if (!url) return

      try {
        const res = await fetch(url)
        const data = await res.json() as { status: string }
        svc.status = data.status === 'ok' ? 'up' : 'down'
      } catch (err) {
        console.error(`Erro ao checar ${svc.key}:`, err)
        svc.status = 'down'
      }
    })
  )
  
}

onMounted(() => {
  fetchAllStatuses()
  setInterval(fetchAllStatuses, 10000) // a cada 10s
})


/** Placeholder para reinício */
function onRestart(key: string) {
  console.log(`Pedir reinício do serviço ${key}`)
}
</script>
