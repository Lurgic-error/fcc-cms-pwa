import { useUsersStore } from '@/stores/useUsersStore'

export function authGuard(to, from, next) {
  const usersStore = useUsersStore()

  if (to.path === '/') {
    if (usersStore.isAuthenticated) {
      return next({ name: 'dashboard.overview' })
    }
    return next({ name: 'login' })
  }

  if (to.meta.guestOnly && usersStore.isAuthenticated) {
    return next({ name: 'dashboard.overview' })
  }

  if (to.meta.requiresAuth && !usersStore.isAuthenticated) {
    return next({
      name: 'login',
      query: {
        redirect: to.fullPath,
      },
    })
  }

  next()
}
