import { useUsersStore } from '@/stores/useUsersStore'

export function permissionGuard(to, from, next) {
  const usersStore = useUsersStore()
  const requiredPermissions = to.meta.permissions

  if (!requiredPermissions || requiredPermissions.length === 0) return next()

  if (!usersStore.hasPermissions(requiredPermissions)) {
    return next({ name: 'unauthorized' })
  }

  next()
}
