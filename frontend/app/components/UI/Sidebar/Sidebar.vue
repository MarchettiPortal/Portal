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

console.log('grupos do usuário:', useAuthStore().user?.grupos)
</script>

<template>
  <aside class="sidebar">
    <ul>
      <!-- IMPORTANTE: iterar em "tree" e não em "sidebarTree/filtered" -->
      <li v-for="n in tree" :key="n.id">
        <NuxtLink v-if="!n.children?.length && n.to" :to="n.to" :class="{ active: isActive(n.to) }">
          <i v-if="n.icon" :class="['icon', n.icon]" /> {{ n.label }}
        </NuxtLink>

        <details v-else open>
          <summary><i v-if="n.icon" :class="['icon', n.icon]" /> {{ n.label }}</summary>
          <ul>
            <li v-for="c in n.children" :key="c.id">
              <NuxtLink v-if="c.to" :to="c.to" :class="{ active: isActive(c.to) }">
                <i v-if="c.icon" :class="['icon', c.icon]" /> {{ c.label }}
              </NuxtLink>
            </li>
          </ul>
        </details>
      </li>
    </ul>
  </aside>
</template>
