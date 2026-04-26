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
  let responseErrorHandler = null

  beforeEach(() => {
    setActivePinia(createPinia())
    responseErrorHandler = null

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
          use: vi.fn(),
        },
        response: {
          use: vi.fn((_success, onError) => {
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
})
