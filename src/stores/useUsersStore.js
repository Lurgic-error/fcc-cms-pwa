import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  clearPersistedSession,
  readPersistedSession,
  writePersistedSession,
} from '@/utils/authSession'

function normalizeValue(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function extractRoleEntries(profile = null, explicitRoles = [], explicitRole = '') {
  const profileRoles = Array.isArray(profile?.roles) ? profile.roles : []
  const combined = [...explicitRoles, ...profileRoles]
  if (explicitRole) combined.push(explicitRole)
  return combined
}

function extractRoleNames(entries = []) {
  const names = entries
    .map((entry) => (typeof entry === 'string' ? entry : entry?.name))
    .map(normalizeValue)
    .filter(Boolean)
  return [...new Set(names)]
}

// Editorial workflow hierarchy:
//   author    → drafts content, submits for approval
//   reviewer  → reads/comments on submissions (no formal approval)
//   editor    → edits any draft, submits
//   publisher → sole approver and publisher; admin-tier bypass
const ROLE_PERMISSION_MAP = Object.freeze({
  author: ['create'],
  reviewer: ['review'],
  editor: ['create', 'update'],
  publisher: ['create', 'update', 'delete', 'review', 'publish', 'archive'],
})

function extractPermissions(entries = [], explicitPermissions = []) {
  const fromRoles = entries.flatMap((entry) => {
    const permissions = Array.isArray(entry?.permissions) ? entry.permissions : []
    return permissions.map((permission) =>
      normalizeValue(typeof permission === 'string' ? permission : permission?.name),
    )
  })

  const normalizedExplicit = explicitPermissions.map(normalizeValue).filter(Boolean)
  const combined = [...new Set([...normalizedExplicit, ...fromRoles].filter(Boolean))]

  if (combined.length === 0 && entries.length > 0) {
    const derivedFromNames = entries.flatMap((entry) => {
      const name = normalizeValue(typeof entry === 'string' ? entry : entry?.name)
      return ROLE_PERMISSION_MAP[name] || []
    })
    return [...new Set(derivedFromNames)]
  }

  return combined
}

export const useUsersStore = defineStore('users', () => {
  const persisted = readPersistedSession() || {}

  const accessToken = ref(persisted.accessToken || '')
  const userId = ref(persisted.userId || '')
  const role = ref(persisted.role || '')
  const roles = ref(Array.isArray(persisted.roles) ? persisted.roles : [])
  const profile = ref(persisted.profile || null)

  const persistedPermissions = Array.isArray(persisted.permissions) ? persisted.permissions : []
  const persistedEntries = extractRoleEntries(
    persisted.profile || null,
    Array.isArray(persisted.roles) ? persisted.roles : [],
    persisted.role || '',
  )
  const permissions = ref(extractPermissions(persistedEntries, persistedPermissions))

  const isAuthenticated = computed(() => Boolean(accessToken.value))

  function persist() {
    writePersistedSession({
      accessToken: accessToken.value,
      userId: userId.value,
      role: role.value,
      roles: roles.value,
      permissions: permissions.value,
      profile: profile.value,
    })
  }

  function normalizedRoles() {
    if (roles.value.length) return roles.value.map(normalizeValue).filter(Boolean)
    return role.value ? [normalizeValue(role.value)] : []
  }

  function setSession({
    accessToken: nextAccessToken = '',
    userId: nextUserId = '',
    role: nextRole = '',
    roles: nextRoles = [],
    permissions: nextPermissions = [],
    profile: nextProfile = null,
  } = {}) {
    accessToken.value = nextAccessToken
    userId.value = nextUserId
    role.value = nextRole
    roles.value = Array.isArray(nextRoles) ? nextRoles : []
    permissions.value = Array.isArray(nextPermissions) ? nextPermissions : []
    profile.value = nextProfile

    persist()
  }

  function setAccessToken(nextAccessToken = '') {
    accessToken.value = nextAccessToken
    persist()
  }

  function setUserId(nextUserId = '') {
    userId.value = nextUserId
    persist()
  }

  function setProfile(nextProfile = null) {
    profile.value = nextProfile
    if (nextProfile?.userId) {
      userId.value = nextProfile.userId
    }

    const entries = extractRoleEntries(nextProfile, roles.value, role.value)
    const roleNames = extractRoleNames(entries)
    const normalizedPermissions = extractPermissions(entries, permissions.value)

    roles.value = roleNames
    role.value = roleNames[0] || ''
    permissions.value = normalizedPermissions

    persist()
  }

  function clearSession() {
    accessToken.value = ''
    userId.value = ''
    role.value = ''
    roles.value = []
    permissions.value = []
    profile.value = null
    clearPersistedSession()
  }

  function hasRole(allowedRoles = []) {
    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return true
    const availableRoles = normalizedRoles()
    return allowedRoles.some((allowedRole) => availableRoles.includes(normalizeValue(allowedRole)))
  }

  function hasPermissions(requiredPermissions = []) {
    if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) return true

    const availablePermissions = permissions.value.map(normalizeValue)
    return requiredPermissions.every((permission) =>
      availablePermissions.includes(normalizeValue(permission)),
    )
  }

  return {
    accessToken,
    isAuthenticated,
    userId,
    profile,
    permissions,
    role,
    roles,
    clearSession,
    hasPermissions,
    hasRole,
    setAccessToken,
    setProfile,
    setSession,
    setUserId,
  }
})
