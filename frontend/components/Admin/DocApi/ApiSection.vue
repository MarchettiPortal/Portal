<template>
  <section class="border-b border-gray-200 pb-4 mb-4">
    <header @click="open = !open" class="flex justify-between items-center cursor-pointer">
      <h2 class="text-lg font-semibold">{{ title }}</h2>
      <svg
        :class="{ 'transform rotate-180': open }"
        class="w-5 h-5 text-gray-500 transition-transform duration-200"
        fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </header>
    <ul v-show="open" class="mt-2 space-y-1">
      <ApiRoute
        v-for="route in filteredRoutes"
        :key="route.method + route.url"
        :route="route"
        @delete="onDeleteRoute(route)"
      />
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue'
import ApiRoute from '~/components/Admin/DocApi/ApiRoute.vue'

interface RouteDoc { method: string; url: string; desc: string }

const props = defineProps<{
  title: string
  routes: RouteDoc[]
  filter: string
  methodFilter: string
}>()

const emit = defineEmits<{
  (e: 'delete-route', payload: { section: string; route: RouteDoc }): void
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
  emit('delete-route', { section: props.title, route })
}
</script>
