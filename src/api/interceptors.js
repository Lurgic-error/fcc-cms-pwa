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

const IDEMPOTENT_POST_PATHS = [
  '/editorial-intake',
  '/fims',
  '/inquiries/create',
  '/inquiries/bulk/create',
  '/inquiries/',
]

const TRACEPARENT_PATTERN = /^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/

function isAuthFreeEndpoint(url = '') {
  return AUTH_FREE_ENDPOINTS.some((path) => url.includes(path))
}

function shouldSkipAuth(config = {}) {
  return Boolean(config.headers?.['x-skip-auth'])
}

function normalizeRole(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
}

function getHeader(headers = {}, name = '') {
  if (typeof headers?.get === 'function') return headers.get(name)

  const target = name.toLowerCase()
  const entry = Object.entries(headers || {}).find(([key]) => key.toLowerCase() === target)
  return entry?.[1]
}

function setHeader(headers = {}, name, value) {
  if (typeof headers?.set === 'function') {
    headers.set(name, value)
    return
  }

  headers[name] = value
}

function hasHeader(headers = {}, name = '') {
  return Boolean(getHeader(headers, name))
}

function randomHex(byteLength) {
  const bytes = new Uint8Array(byteLength)
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes)
  } else {
    bytes.forEach((_, index) => {
      bytes[index] = Math.floor(Math.random() * 256)
    })
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function createIdempotencyKey() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }

  const bytes = new Uint8Array(16)
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes)
  } else {
    bytes.forEach((_, index) => {
      bytes[index] = Math.floor(Math.random() * 256)
    })
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
    16,
    20,
  )}-${hex.slice(20)}`
}

export function createTraceparent() {
  return `00-${randomHex(16)}-${randomHex(8)}-01`
}

function getInitialTraceparent() {
  const fromWindow = globalThis.window?.__FCC_TRACEPARENT__
  if (TRACEPARENT_PATTERN.test(fromWindow || '')) return fromWindow

  const fromMeta = globalThis.document
    ?.querySelector?.('meta[name="traceparent"]')
    ?.getAttribute?.('content')
  if (TRACEPARENT_PATTERN.test(fromMeta || '')) return fromMeta

  return ''
}

export function shouldAttachIdempotencyKey(config = {}) {
  const method = String(config.method || '').toLowerCase()
  if (method !== 'post') return false
  if (hasHeader(config.headers, 'Idempotency-Key')) return false
  if (String(getHeader(config.headers, 'x-skip-idempotency') || '').toLowerCase() === 'true') {
    return false
  }

  const url = String(config.url || '')
  return IDEMPOTENT_POST_PATHS.some((path) => url.includes(path))
}

function attachIdempotencyKey(config = {}) {
  if (!shouldAttachIdempotencyKey(config)) return
  setHeader(config.headers, 'Idempotency-Key', createIdempotencyKey())
}

function attachTraceparent(config = {}) {
  const existing = getHeader(config.headers, 'traceparent')
  if (TRACEPARENT_PATTERN.test(existing || '')) {
    setHeader(config.headers, 'traceparent', existing)
    return
  }

  setHeader(config.headers, 'traceparent', getInitialTraceparent() || createTraceparent())
}

export function parseApiDeprecationHeaders(headers = {}) {
  const sunset = getHeader(headers, 'Sunset')
  const deprecation = getHeader(headers, 'Deprecation')
  if (!sunset && !deprecation) return null

  return {
    sunset,
    deprecation,
  }
}

function canShowSystemAdminNotice() {
  try {
    const pinia = getActivePinia()
    if (!pinia) return false

    const usersStore = useUsersStore(pinia)
    const roles = [...(usersStore.roles || []), usersStore.role]
      .map(normalizeRole)
      .filter(Boolean)
    return roles.some((role) => role === 'system admin' || role === 'system administrator')
  } catch {
    return false
  }
}

function shouldShowDeprecationBanner() {
  return import.meta.env.VITE_SHOW_DEPRECATION_BANNER === 'true'
}

function handleDeprecationHeaders(response = {}) {
  const notice = parseApiDeprecationHeaders(response.headers)
  if (!notice) return

  const detail = {
    ...notice,
    url: response.config?.url || '',
  }

  console.warn('Deprecated API response received.', detail)

  if (!shouldShowDeprecationBanner() || !canShowSystemAdminNotice()) return
  globalThis.window?.dispatchEvent?.(new CustomEvent('fcc:api-deprecation', { detail }))
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
      config.headers = config.headers || {}
      attachTraceparent(config)
      attachIdempotencyKey(config)

      if (shouldSkipAuth(config)) return config

      const token = getPersistedAccessToken()
      if (!token) return config

      config.headers.Authorization = `Bearer ${token}`
      return config
    },
    (error) => Promise.reject(error),
  )

  instance.interceptors.response.use(
    (response) => {
      handleDeprecationHeaders(response)
      return response
    },
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
