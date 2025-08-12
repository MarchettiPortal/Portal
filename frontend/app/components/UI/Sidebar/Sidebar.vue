<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { sidebarTree, type Node } from '~/components/UI/Sidebar/SidebarItems'
import { useAuthStore } from '~/stores/auth'
import { filterTreeByGroups } from '~/composables/Sidebar/useAcl'

const auth = useAuthStore()
const route = useRoute()

// usa a versão já filtrada + com herança de groups
const tree = computed(() => filterTreeByGroups(sidebarTree, auth.acl))

const isActive = (path?: string) => path && route.path.startsWith(path)

</script>

<template>
  <aside class="flex h-screen w-64 flex-col bg-[#252626] text-white">
    <div class="flex-none border-b border-white/10 p-4">
      <img src="/images/SidebarLogo.png" alt="Logo" class="h-10 w-auto" />
    </div>

    <ul class="flex-1 overflow-y-auto p-2 space-y-1">
      <li v-for="n in tree" :key="n.id">
        <!-- item folha -->
        <NuxtLink
          v-if="!n.children?.length && n.to"
          :to="n.to"
          :class="[
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/90 hover:bg-red-700',
            isActive(n.to) ? 'bg-red-700 text-white font-medium' : ''
          ]"
        >
          <Icon v-if="n.icon" :name="n.icon" class="h-4 w-4 shrink-0" />
          <span class="truncate">{{ n.label }}</span>
        </NuxtLink>

        <!-- grupo -->
        <details v-else class="group">
          <summary
            class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wide text-white/70 hover:bg-white/5"
          >
            <Icon v-if="n.icon" :name="n.icon" class="h-4 w-4 shrink-0" />
            <span>{{ n.label }}</span>
            <svg class="ml-auto h-4 w-4 transition group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd"/>
            </svg>
          </summary>

          <ul class="mt-1 space-y-1 border-l border-white/10 pl-3">
            <li v-for="c in n.children" :key="c.id">
              <NuxtLink
                v-if="c.to"
                :to="c.to"
                :class="[
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white',
                  isActive(c.to) ? 'bg-white/10 text-white font-medium' : ''
                ]"
              >
                <Icon v-if="c.icon" :name="c.icon" class="h-4 w-4 shrink-0" />
                <span class="truncate">{{ c.label }}</span>
              </NuxtLink>
            </li>
          </ul>
        </details>
      </li>
    </ul>
  </aside>
</template>
