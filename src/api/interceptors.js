import axios from 'axios'
import { getActivePinia } from 'pinia'
import { useUsersStore } from '@/stores/useUsersStore'
import {
  clearPersistedSession,
  getPersistedAccessToken,
  mergePersistedSession,
} from '@/utils/authSession'

const AUTH_FREE_ENDPOINTS = [
  '/users/login',
  '/users/forgot-password',
  '/users/reset-password',
  '/users/validate-recovery-token',
  '/refresh-token',
]

function isAuthFreeEndpoint(url = '') {
  return AUTH_FREE_ENDPOINTS.some((path) => url.includes(path))
}

function shouldSkipAuth(config = {}) {
  return Boolean(config.headers?.['x-skip-auth'])
}

async function refreshAccessToken(baseURL) {
  const { data } = await axios.get('/refresh-token', {
    baseURL,
    withCredentials: true,
    headers: {
      Accept: 'application/json',
      'x-skip-auth': 'true',
    },
  })

  if (!data?.accessToken) {
    throw new Error('Session refresh failed.')
  }

  mergePersistedSession({ accessToken: data.accessToken })
  return data.accessToken
}

let refreshPromise = null

async function getNewToken(baseURL) {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(baseURL).finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

function clearClientSession() {
  try {
    const pinia = getActivePinia()
    if (pinia) {
      useUsersStore(pinia).clearSession()
      return
    }
  } catch {
    // Fall back to clearing persisted storage only when Pinia is unavailable.
  }

  clearPersistedSession()
}

export function registerInterceptors(instance) {
  instance.interceptors.request.use(
    (config) => {
      if (shouldSkipAuth(config)) return config

      const token = getPersistedAccessToken()
      if (!token) return config

      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
      return config
    },
    (error) => Promise.reject(error),
  )

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const statusCode = error?.response?.status
      const originalRequest = error?.config

      if (
        statusCode !== 401 ||
        !originalRequest ||
        originalRequest.__retried ||
        isAuthFreeEndpoint(originalRequest.url || '')
      ) {
        return Promise.reject(error)
      }

      originalRequest.__retried = true

      try {
        const nextToken = await getNewToken(instance.defaults.baseURL)
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${nextToken}`
        return instance(originalRequest)
      } catch (refreshError) {
        clearClientSession()
        return Promise.reject(refreshError)
      }
    },
  )
}
