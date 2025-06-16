<template>
  <NuxtLink
    :to="to"
    class="hover:bg-red-700 cursor-pointer rounded-xs p-1 flex items-center gap-2 overflow-hidden"
    :class="[isActive ? 'bg-red-700' : 'text-gray-600']"
  >
    <div class="w-6 h-6 flex items-center justify-center shrink-0">
     <Icon v-if="icon" :icon="icon" class="[&[data-icon='material-symbols:house-rounded']]:text-[28px] text-2xl text-white" />
    </div>

    <span
      class="transition-all whitespace-nowrap duration-300 ease-in-out text-white"
      :class="expanded ? 'opacity-100 ml-1 w-auto' : 'opacity-0 ml-0 w-0 pointer-events-none'"
    >
      {{ label }}
    </span>
    <div
      v-if="expanded"
      class="ml-auto pr-1 flex items-center"
      @click.stop.prevent="togglePin"
    >
      <Icon
        :icon="pinned ? 'material-symbols:star-rounded' : 'material-symbols:star-outline-rounded'"
        size="20"
      />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useSidebarStore } from '~/stores/UI/sidebar'

const props = defineProps<{
  label: string
  icon?: string
  to: string
  expanded: boolean
}>()

const route = useRoute()

const isActive = computed(() => route.path === props.to)

const sidebar = useSidebarStore()
const pinned = computed(() => sidebar.isPinned(props.to))
const togglePin = () => {
  sidebar.togglePin({ label: props.label, icon: props.icon, to: props.to })
}
</script>