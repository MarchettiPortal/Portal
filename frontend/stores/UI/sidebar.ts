import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface PinnedItem {
  label: string
  icon?: string
  to: string
}

export const useSidebarStore = defineStore('sidebar', () => {
  const pinnedItems = ref<PinnedItem[]>([])

  // Carrega do localStorage se disponível
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('pinned-sidebar')
      if (saved) pinnedItems.value = JSON.parse(saved)
    } catch (err) {
      console.error('Erro ao carregar itens fixados', err)
    }
  }

  // Salva sempre que modificar
  watch(pinnedItems, (items) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('pinned-sidebar', JSON.stringify(items))
    }
  }, { deep: true })

  const isPinned = (to: string) => pinnedItems.value.some(item => item.to === to)

  const togglePin = (item: PinnedItem) => {
    const index = pinnedItems.value.findIndex(p => p.to === item.to)
    if (index !== -1) {
      pinnedItems.value.splice(index, 1)
    } else {
      pinnedItems.value.push(item)
    }
  }

  return {
    pinnedItems,
    isPinned,
    togglePin
  }
})