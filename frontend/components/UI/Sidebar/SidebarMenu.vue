<template>
  <div class="pt-4 space-y-2">
    <div v-if="pinnedItems.length" class="space-y-1 pb-2 border-b border-gray-700">
      <SidebarMenuItem
        v-for="item in pinnedItems"
        :key="item.to"
        :icon="item.icon"
        :label="item.label"
        :to="item.to"
        :expanded="expanded"
      />
    </div>

    <SidebarMenuItem icon="material-symbols:home-rounded" label="Home" to="" :expanded="expanded" />
    
    <SidebarMenuGroup icon="material-symbols:document-scanner-rounded" label="Procedimentos" :expanded="expanded">
      <SidebarSubItem icon="material-symbols:settings-system-daydream-outline" label="Sistemas" to="/Admin/Procedimentos/procedimentosSistemas" :expanded="expanded"/>
      <SidebarSubItem icon="material-symbols:devices-outline-rounded" label="Dispositivos" to="" :expanded="expanded"/>
    </SidebarMenuGroup>
    
    <SidebarMenuGroup icon="material-symbols:space-dashboard-rounded" label="Dashboards" :expanded="expanded">
      <SidebarSubItem label="SLA - Chamados" to="" icon="material-symbols:speed" :expanded="expanded" />
      <SidebarSubItem label="Kaspersky" to="" icon="material-symbols:security" :expanded="expanded" />
      <SidebarSubItem label="Disp. do Ambiente" to="" icon="material-symbols:source-environment-rounded" :expanded="expanded" />
      <SidebarSubItem label="Chamados Reabertos" to="" icon="material-symbols:restore-page-outline-rounded" :expanded="expanded" />
    </SidebarMenuGroup>

    <!--Grupo TI-Infraestrutura -->
    <SidebarMenuGroup icon="material-symbols:terminal" label="TI - Infraestrutura" :expanded="expanded">
      <SidebarSubItem label="Chamados" to="/Admin/chamados" icon="material-symbols:sticky-note-2-outline-rounded" :expanded="expanded" />
      <SidebarSubItem label="Criar chamados" to="/Users/chamados" icon="material-symbols:sticky-note-2-outline-rounded" :expanded="expanded" />
      <SidebarSubItem label="Usuários" to="/Admin/usersEdit" icon="material-symbols:user-attributes" :expanded="expanded" />
      <SidebarSubItem label="Arquivos" to="" icon="material-symbols:docs-outline-rounded" :expanded="expanded" />
      <SidebarSubItem label="Documentação" to="/Admin/apiDocs" icon="material-symbols:lab-profile-outline-rounded" :expanded="expanded" />
      <SidebarSubItem label="Estoque" to="" icon="material-symbols:stockpot-outline-rounded" :expanded="expanded" />
      <SidebarSubItem label="Pedido de Compras" to="" icon="material-symbols:shopping-cart-outline-rounded" :expanded="expanded" />
      <SidebarSubItem label="Serviços" to="/Admin/Servicos" icon="material-symbols:linked-services-outline" :expanded="expanded" />
      
    </SidebarMenuGroup>
    <!---------------------------->


    <!--Grupo Engenharia de Produto-->
    <SidebarMenuGroup icon="material-symbols:engineering-outline-sharp" label="Engenharia P." :expanded="expanded">
      <SidebarSubItem label="CLP" to="/Users/EngenhariaP/CLP" icon="material-symbols:memory-rounded"
        :expanded="expanded" />
        <SidebarSubItem label="CLPLog" to="/Users/EngenhariaP/CLPLOG" icon="material-symbols:receipt-long-outline-rounded"
        :expanded="expanded" />
    </SidebarMenuGroup>
  </div>
</template>

<script setup lang="ts">
import SidebarMenuItem from './SidebarMenuItem.vue'
import SidebarMenuGroup from './SidebarMenuGroup.vue'
import SidebarSubItem from './SidebarSubItem.vue'
import { computed } from 'vue'
import { useSidebarStore } from '~/stores/UI/sidebar'

const props = defineProps<{ expanded: boolean }>()

const sidebar = useSidebarStore()
const pinnedItems = computed(() => sidebar.pinnedItems)
</script>