<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
import { reactive } from 'vue'
import StatusCard from '~/components/Admin/Servicos/ServicosCard.vue'

definePageMeta({
    layout: 'adm-layout'
})

type ServiceStatus = 'up' | 'down'
interface Service { key: string; label: string; status: ServiceStatus }

const services = reactive<Service[]>([
  { key: 'wps-ftp',      label: 'Status WPS/FTP',     status: 'up'   },
  { key: 'remote-clp',   label: 'Serviço remoto CLP', status: 'up'   },
  { key: 'wps-weg',      label: 'SV-WPS-WEG',         status: 'down' },
  { key: 'intranet-sql', label: 'SV-Intranet-SQL',    status: 'up'   },
  { key: 'postgresql',   label: 'Status PostgreSQL',  status: 'up'   },
  { key: 'nginx',        label: 'Status NGINX',       status: 'down' },
])

/** Placeholder para reinício */
function onRestart(key: string) {
  console.log(`Pedir reinício do serviço ${key}`)
}
</script>
