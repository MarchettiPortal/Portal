<template>
  <section class="border-b border-gray-200 pb-4 mb-4">
    <header class="flex justify-between items-center">
      <button
        type="button"
        @click="open = !open"
        class="flex items-center space-x-1 flex-1 text-left"
      >
        <h2 class="text-lg font-semibold">{{ title }}</h2>
        <svg
          :class="{ 'transform rotate-180': open }"
          class="w-5 h-5 text-gray-500 transition-transform duration-200"
          fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <button
        @click="emit('delete-section', id)"
        class="p-1 text-red-600 hover:bg-red-100 rounded"
        title="Excluir seção"
      >
        <Icon name="material-symbols:delete-outline" width="18" inline />
      </button>
    </header>
    <ul v-show="open" class="mt-2 space-y-1">
      <ApiRoute
        v-for="route in filteredRoutes"
        :key="route.id ?? route.method + route.url"
        :route="route"
        @delete="onDeleteRoute(route)"
      />
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'
import ApiRoute from '~/components/Admin/DocApi/ApiRoute.vue'

interface RouteDoc { id?: number; method: string; url: string; desc: string }

const props = defineProps<{
  id: number
  title: string
  routes: RouteDoc[]
  filter: string
  methodFilter: string
}>()

const emit = defineEmits<{
  (e: 'delete-route', payload: { sectionId: number; route: RouteDoc }): void
  (e: 'delete-section', id: number): void
}>()

const open = ref(true)

const filteredRoutes = computed(() => {
  return props.routes.filter(r => {
    const txt = `${r.method} ${r.url} ${r.desc}`.toLowerCase()
    const matchText   = !props.filter || txt.includes(props.filter.toLowerCase())
    const matchMethod = !props.methodFilter || r.method === props.methodFilter
    return matchText && matchMethod
  })
})

function onDeleteRoute(route: RouteDoc) {
  emit('delete-route', { sectionId: props.id, route })
}
</script>