import { inGroupAny, routeGroupMap } from '~/composables/Sidebar/useAcl'

export default defineNuxtRouteMiddleware((to) => {
    const auth = useAuthStore()

    if (!auth.isLogged && to.path !== '/login') {
        return navigateTo({ path: '/login', query: { redirect: to.fullPath }} )
    }

    const metaGroups = to.meta?.groups as string[] | undefined

    const cfgGroups = routeGroupMap[to.path]?.groups

    const ok = inGroupAny(
  auth.acl,
  (to.meta?.groups as string[] | undefined) ?? routeGroupMap[to.path]?.groups
)
if (ok === false) return navigateTo('/403')

})