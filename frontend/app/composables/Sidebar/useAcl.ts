// composables/useAcl.ts
import type { GroupACL } from '~/types/auth'
import { sidebarTree } from '~/components/UI/Sidebar/SidebarItems'

export const inGroupAny = (acl: GroupACL|null, required?: string[]) => {
  if (!acl) return false
  const userGroups = Array.isArray(acl.groups) ? acl.groups : []
  if (!required || required.length === 0) return true  // sem groups => qualquer logado
  return required.some(g => userGroups.includes(g))
}

type Node = (typeof sidebarTree)[number]

/** Filtra a árvore herdando groups do pai quando o filho não define */
export function filterTreeByGroups(
  nodes: Node[],
  acl: GroupACL|null,
  inherited?: string[]
): Node[] {
  const out: Node[] = []
  for (const n of nodes) {
    const required = n.groups ?? inherited
    const children = n.children ? filterTreeByGroups(n.children as Node[], acl, required) : undefined
    const isLeaf = !children || children.length === 0
    const selfVisible = isLeaf && inGroupAny(acl, required)
    const visible = selfVisible || (children && children.length > 0)
    if (visible) out.push({ ...n, children } as Node)
  }
  return out
}

/** Mapa rota -> groups já com herança aplicada (para o middleware) */
function flattenWithInheritance(
  nodes: Node[],
  inherited?: string[],
  acc: Record<string, { groups?: string[] }> = {}
) {
  for (const n of nodes) {
    const required = n.groups ?? inherited
    if (n.to) acc[n.to] = { groups: required }
    if (n.children?.length) flattenWithInheritance(n.children as Node[], required, acc)
  }
  return acc
}
export const routeGroupMap = flattenWithInheritance(sidebarTree)
