import { useUsersStore } from '@/stores/useUsersStore'

export function roleGuard(to, from, next) {
  const usersStore = useUsersStore()
  const allowedRoles = to.meta.roles

  if (!allowedRoles || allowedRoles.length === 0) return next()

  if (!usersStore.hasRole(allowedRoles)) {
    return next({ name: 'unauthorized' })
  }

  next()
}
