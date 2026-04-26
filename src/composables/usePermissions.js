import { computed } from 'vue'

import { useUsersStore } from '@/stores/useUsersStore'

function toArray(value) {
  if (Array.isArray(value)) return value
  if (value === undefined || value === null || value === '') return []
  return [value]
}

export function usePermissions() {
  const usersStore = useUsersStore()

  const isAuthenticated = computed(() => usersStore.isAuthenticated)
  const role = computed(() => usersStore.role)
  const roles = computed(() => usersStore.roles)
  const permissions = computed(() => usersStore.permissions)

  function hasRole(value) {
    return usersStore.hasRole(toArray(value))
  }

  function hasPermission(value) {
    return usersStore.hasPermissions(toArray(value))
  }

  function canAccess({ roles: allowedRoles = [], permissions: requiredPermissions = [] } = {}) {
    return hasRole(allowedRoles) && hasPermission(requiredPermissions)
  }

  return {
    isAuthenticated,
    role,
    roles,
    permissions,
    hasRole,
    hasPermission,
    canAccess,
  }
}
