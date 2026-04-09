import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { usersAPI } from '@/api'
import { useUsersStore } from './useUsersStore'

function resolveErrorMessage(error) {
  if (typeof error === 'string') return error
  return error?.response?.data?.error || error?.message || 'Request failed.'
}

export const useAuthStore = defineStore('auth', () => {
  const usersStore = useUsersStore()
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => usersStore.isAuthenticated)

  function setLoading(value) {
    loading.value = Boolean(value)
  }

  function setError(value = null) {
    error.value = value
  }

  async function withAuthTask(task) {
    setLoading(true)
    setError(null)
    try {
      return await task()
    } catch (err) {
      const message = resolveErrorMessage(err)
      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  function canAccess(meta = {}) {
    if (meta.requiresAuth && !usersStore.isAuthenticated) return false
    if (Array.isArray(meta.roles) && meta.roles.length && !usersStore.hasRole(meta.roles))
      return false
    if (
      Array.isArray(meta.permissions) &&
      meta.permissions.length &&
      !usersStore.hasPermissions(meta.permissions)
    )
      return false
    return true
  }

  async function hydrateCurrentUser(nextUserId = '') {
    const userId = nextUserId || usersStore.userId
    if (!userId) return null

    const res = await usersAPI.fetchUserProfile({ userId })
    if (res?.error) {
      throw new Error(res.error)
    }

    usersStore.setProfile(res?.profile || null)
    return res?.profile || null
  }

  async function initialize() {
    if (!usersStore.accessToken) return false
    if (!usersStore.userId) {
      usersStore.clearSession()
      return false
    }

    try {
      if (!usersStore.profile && usersStore.userId) {
        await hydrateCurrentUser()
      }
      return true
    } catch {
      usersStore.clearSession()
      return false
    }
  }

  async function refreshSession() {
    return withAuthTask(async () => {
      const res = await usersAPI.refreshToken()
      if (res?.error) throw new Error(res.error)
      if (!res?.accessToken) throw new Error('Unable to refresh session.')

      usersStore.setAccessToken(res.accessToken)
      return res.accessToken
    })
  }

  async function login({ email, password }) {
    return withAuthTask(async () => {
      const res = await usersAPI.loginUser({ email, password })
      if (res?.error) throw new Error(res.error)
      if (!res?.accessToken || !res?.userId) throw new Error('Invalid login response.')

      usersStore.setSession({
        accessToken: res.accessToken,
        userId: res.userId,
      })

      await hydrateCurrentUser(res.userId)
      return res
    })
  }

  async function forgotPassword({ email }) {
    return withAuthTask(async () => {
      const res = await usersAPI.forgotPassword({ email })
      if (res?.error) throw new Error(res.error)
      return res
    })
  }

  async function resetPassword({ email, token, password, confirmedPassword }) {
    return withAuthTask(async () => {
      const res = await usersAPI.resetPassword({
        email,
        token,
        password,
        confirmedPassword,
      })
      if (res?.error) throw new Error(res.error)
      return res
    })
  }

  async function logout() {
    const currentUserId = usersStore.userId
    if (currentUserId) {
      try {
        await usersAPI.logoutUser({ userId: currentUserId })
      } catch {
        // Session will still be cleared client-side.
      }
    }

    usersStore.clearSession()
  }

  return {
    isAuthenticated,
    loading,
    error,
    canAccess,
    forgotPassword,
    hydrateCurrentUser,
    initialize,
    login,
    logout,
    refreshSession,
    resetPassword,
  }
})
