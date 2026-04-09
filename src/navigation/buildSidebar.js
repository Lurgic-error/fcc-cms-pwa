import moduleRoutes from '@/router/modules'
import { useAuthStore } from '@/stores/useAuthStore'
import { buildNavigation } from './buildNavigation'

export function buildSidebar() {
  const authStore = useAuthStore()

  const navigation = buildNavigation(moduleRoutes, {
    canAccess: authStore.canAccess,
  })

  return navigation.sidebar
}
