<template>
  <li class="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded transition">
    <div class="flex items-center space-x-2">
      <span 
        class="text-xs font-medium px-2 py-1 rounded"
        :class="{
          'bg-green-100 text-green-800': route.method === 'GET',
          'bg-blue-100 text-blue-800':  route.method === 'POST',
          'bg-yellow-100 text-yellow-800': route.method === 'PUT',
          'bg-red-100 text-red-800':    route.method === 'DELETE',
          'bg-gray-100 text-gray-800':  route.method === 'PATH',
        }"
      >
        {{ route.method }}
      </span>
      <code class="font-mono text-sm">{{ route.url }}</code>
    </div>
    <div class="flex items-center space-x-2">
      <p class="text-sm text-gray-600">{{ route.desc }}</p>
      <!-- botao copiar -->
      <button @click="copy" class="p-1 hover:bg-gray-200 cursor-pointer rounded">
        <Icon name="ic:baseline-content-copy" width="18" inline />
      </button>
      <!-- botao deletar -->
      <button @click="$emit('delete')" class="p-1 cursor-pointer hover:bg-red-100 rounded">
        <Icon 
          name="material-symbols:delete-outline" 
          width="18" 
          inline 
          class="text-red-600 " 
        />
      </button>
    </div>
  </li>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

interface RouteDoc { id?: number; method: string; url: string; desc: string }
const props = defineProps<{ route: RouteDoc }>()

function copy() {
  navigator.clipboard.writeText(`${props.route.method} ${props.route.url}`)
}
</script>