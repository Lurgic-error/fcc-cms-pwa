import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/useAuthStore'

export function useRouteAccess() {
  const router = useRouter()
  const authStore = useAuthStore()

  function getRouteMeta(routeName = '') {
    if (!routeName || !router.hasRoute(routeName)) return null
    return router.getRoutes().find((route) => route.name === routeName)?.meta || {}
  }

  function canAccessRoute(routeName = '') {
    const meta = getRouteMeta(routeName)
    return Boolean(meta) && authStore.canAccess(meta)
  }

  return {
    getRouteMeta,
    canAccessRoute,
  }
}
