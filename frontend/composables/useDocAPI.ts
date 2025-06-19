import { NewLineKind } from 'typescript'
import { ref, reactive } from 'vue'
import { loadRouteLocation } from 'vue-router'
import { config } from '~/config/global.config'

export interface Section {
    id: number
    title: string
}

export interface Route {
    id: number
    section_id: number
    method: string
    url: string
    description?: string
    display_order: number
}

export function useDocAPI() {

    const sections = ref<Section[]>([])
    const routesBySection = reactive<Record<number, Route[]>>({})

//sections 

    async function loadSections() {
        sections.value = await $fetch<Section[]>(`${config.API_BACKEND}/doc/listSections`)
    }

    async function addSection(name: string) {
    const trimmed = name.trim()
    if (!trimmed) {
      alert('Digite um nome válido')
      return
    }

    // determina a ordem; por ex. pega o tamanho atual + 1
    const nextOrder = sections.value.length + 1

    try {
      const newSec = await $fetch<Section>(
        `${config.API_BACKEND}/doc/addSections`,
        {
          method: 'POST',
          body: {
            title: trimmed,            // campo correto
            display_order: nextOrder   // <— obrigatório
          }
        }
      )
      sections.value.push(newSec)
    } catch (err: any) {
      console.error('Erro ao criar seção:', err.data || err)
      alert(err.data?.error || 'Não foi possível criar a seção.')
    }
  }

//pq esse tem id:number, name:string e o loadSection nao tem
    async function editSection(id: number, name:string) {
        const updated = await $fetch<Section>(`${config.API_BACKEND}/doc/editSections/${id}`, {
            method: 'PUT',
            body: { name }
        })
        const idx = sections.value.findIndex(s => s.id === id)
        if (idx !== -1) sections.value[idx] = updated
    }

    async function deleteSection(id: number) {
        await $fetch(`${config.API_BACKEND}/doc/deleteSections/${id}`, { method: 'DELETE'})
        sections.value = sections.value.filter(s => s.id !== id)
        delete routesBySection[id]
    }

//Rotas

    async function loadRoutes(sectionId: number) {
        routesBySection[sectionId] = await $fetch<Route[]>(`${config.API_BACKEND}/doc/listRoutes/${sectionId}`)
    }

    async function addRoute(
    sectionId: number,
    data: { method: string; url: string; description?: string }
  ) {
    // 1) calcula o próximo display_order
    const nextOrder =
      (routesBySection[sectionId]?.length ?? 0) + 1

    // 2) chama o endpoint com os campos corretos
    const newR = await $fetch<Route>(
      `${config.API_BACKEND}/doc/addRoutes`, {
        method: 'POST',
        body: {
          section_id:    sectionId,
          method:        data.method,
          url:           data.url,
          description:   data.description ?? '',
          display_order: nextOrder
        }
      }
    )

    // 3) atualiza o estado local
    routesBySection[sectionId] = routesBySection[sectionId] || []
    routesBySection[sectionId].push(newR)
  }

    async function editRoute(id: number, data: Partial<Route>) {
        const updated = await $fetch<Route>(`${config.API_BACKEND}/doc/editRoute/${id}`, {
            method: 'PUT',
            body: data
        })
        const list = routesBySection[updated.section_id] || []
        const idx = list.findIndex(r => r.id === id)
        if (idx !== -1) list[idx] = updated
        }
        
    async function deleteRoute(id: number, sectionId: number) {
        await $fetch(`${config.API_BACKEND}/doc/deleteRoute/${id}`, { method: `DELETE` })
        routesBySection[sectionId] = (routesBySection[sectionId] || []).filter(r => r.id !== id)
    }

    return {
        sections,
        routesBySection,
        loadSections,
        addSection,
        editSection,
        deleteSection,
        loadRoutes,
        addRoute,
        editRoute,
        deleteRoute,
    }

}