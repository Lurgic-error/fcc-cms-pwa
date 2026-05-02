import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import axios from 'axios'
import { useUsersStore } from '@/stores/useUsersStore'
import { SESSION_STORAGE_KEY } from '@/utils/authSession'
import { registerInterceptors } from './interceptors'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

let requestHandler = null
let responseSuccessHandler = null
let responseErrorHandler = null

function createStorageMock() {
  const storage = new Map()

  return {
    getItem: vi.fn((key) => (storage.has(key) ? storage.get(key) : null)),
    setItem: vi.fn((key, value) => {
      storage.set(key, value)
    }),
    removeItem: vi.fn((key) => {
      storage.delete(key)
    }),
  }
}

describe('registerInterceptors', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    requestHandler = null
    responseSuccessHandler = null
    responseErrorHandler = null
    vi.unstubAllEnvs()

    Object.defineProperty(window, 'localStorage', {
      value: createStorageMock(),
      configurable: true,
    })

    const usersStore = useUsersStore()
    usersStore.setSession({
      accessToken: 'stale-token',
      userId: 'user-001',
      role: 'admin',
    })

    axios.get.mockReset()
  })

  it('clears the users store when token refresh fails', async () => {
    axios.get.mockRejectedValue(new Error('refresh failed'))

    const instance = {
      defaults: {
        baseURL: 'https://cms.example.test',
      },
      interceptors: {
        request: {
          use: vi.fn((onSuccess) => {
            requestHandler = onSuccess
          }),
        },
        response: {
          use: vi.fn((onSuccess, onError) => {
            responseSuccessHandler = onSuccess
            responseErrorHandler = onError
          }),
        },
      },
    }

    registerInterceptors(instance)

    await expect(
      responseErrorHandler({
        response: { status: 401 },
        config: {
          url: '/protected/resource',
          headers: {},
        },
      }),
    ).rejects.toThrow('refresh failed')

    const usersStore = useUsersStore()
    expect(usersStore.isAuthenticated).toBe(false)
    expect(window.localStorage.removeItem).toHaveBeenCalledWith(SESSION_STORAGE_KEY)
  })

  it('adds Idempotency-Key to retry-safe POST mutations and honors opt-out', () => {
    const instance = createInterceptorInstance()

    registerInterceptors(instance)

    const nextConfig = requestHandler({
      method: 'post',
      url: '/inquiries/create',
      headers: {},
    })

    expect(nextConfig.headers['Idempotency-Key']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )

    const optedOut = requestHandler({
      method: 'post',
      url: '/inquiries/create',
      headers: {
        'x-skip-idempotency': 'true',
      },
    })

    expect(optedOut.headers['Idempotency-Key']).toBeUndefined()
  })

  it('adds W3C traceparent and preserves an existing valid traceparent', () => {
    const instance = createInterceptorInstance()
    const existing = '00-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-bbbbbbbbbbbbbbbb-01'

    registerInterceptors(instance)

    const generated = requestHandler({
      method: 'get',
      url: '/events',
      headers: {},
    })
    const forwarded = requestHandler({
      method: 'get',
      url: '/events',
      headers: {
        traceparent: existing,
      },
    })

    expect(generated.headers.traceparent).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/)
    expect(forwarded.headers.traceparent).toBe(existing)
  })

  it('dispatches gated deprecation notices for system admins', () => {
    vi.stubEnv('VITE_SHOW_DEPRECATION_BANNER', 'true')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const dispatchEvent = vi.spyOn(window, 'dispatchEvent')
    const usersStore = useUsersStore()
    usersStore.setSession({
      accessToken: 'token',
      userId: 'user-001',
      role: 'system admin',
    })
    const instance = createInterceptorInstance()

    registerInterceptors(instance)

    responseSuccessHandler({
      headers: {
        Sunset: 'Wed, 01 Jan 2027 00:00:00 GMT',
        Deprecation: 'true',
      },
      config: { url: '/api/v1/events' },
    })

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Deprecated API response'),
      expect.objectContaining({
        deprecation: 'true',
        sunset: 'Wed, 01 Jan 2027 00:00:00 GMT',
      }),
    )
    expect(dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'fcc:api-deprecation',
      }),
    )

    warn.mockRestore()
    dispatchEvent.mockRestore()
  })

  it('does not dispatch deprecation notices while the feature flag is disabled', () => {
    vi.stubEnv('VITE_SHOW_DEPRECATION_BANNER', 'false')
    const dispatchEvent = vi.spyOn(window, 'dispatchEvent')
    const usersStore = useUsersStore()
    usersStore.setSession({
      accessToken: 'token',
      userId: 'user-001',
      role: 'system admin',
    })
    const instance = createInterceptorInstance()

    registerInterceptors(instance)

    responseSuccessHandler({
      headers: {
        Sunset: 'Wed, 01 Jan 2027 00:00:00 GMT',
        Deprecation: 'true',
      },
      config: { url: '/api/v1/events' },
    })

    expect(dispatchEvent).not.toHaveBeenCalled()
    dispatchEvent.mockRestore()
  })
})

function createInterceptorInstance() {
  return {
    defaults: {
      baseURL: 'https://cms.example.test',
    },
    interceptors: {
      request: {
        use: vi.fn((onSuccess) => {
          requestHandler = onSuccess
        }),
      },
      response: {
        use: vi.fn((onSuccess, onError) => {
          responseSuccessHandler = onSuccess
          responseErrorHandler = onError
        }),
      },
    },
  }
}
