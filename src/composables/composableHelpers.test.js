import { createPinia, setActivePinia } from 'pinia'
import { effectScope, nextTick, ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useUsersStore } from '@/stores/useUsersStore'
import { useAutosave } from './useAutosave'
import { usePermissions } from './usePermissions'
import { useWorkflow } from './useWorkflow'

describe('shared composables', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      configurable: true,
    })
  })

  it('derives permission checks from the users store', () => {
    const usersStore = useUsersStore()
    usersStore.setSession({
      accessToken: 'token-001',
      userId: 'user-001',
      role: 'admin',
      roles: ['admin'],
      permissions: ['publish', 'archive'],
    })

    const permissions = usePermissions()

    expect(permissions.isAuthenticated.value).toBe(true)
    expect(permissions.hasRole('admin')).toBe(true)
    expect(permissions.hasPermission('publish')).toBe(true)
    expect(permissions.canAccess({ roles: ['admin'], permissions: ['archive'] })).toBe(true)
  })

  it('exposes normalized workflow metadata for a record', () => {
    const record = ref({
      recordId: 'rec-001',
      published: true,
      scheduledUnpublishAt: '2026-05-01T08:00:00.000Z',
    })

    const workflow = useWorkflow(record)

    expect(workflow.status.value).toBe('published')
    expect(workflow.isPublished.value).toBe(true)
    expect(workflow.schedule.value.hasUnpublishSchedule).toBe(true)
  })

  it('debounces autosave and persists the latest state', async () => {
    vi.useFakeTimers()

    const source = ref({ title: 'Draft title' })
    const save = vi.fn(async () => {})
    let autosave
    const scope = effectScope()

    scope.run(() => {
      autosave = useAutosave(source, save, { delay: 200 })
    })

    source.value = { title: 'Published title' }
    await nextTick()

    expect(autosave.pending.value).toBe(true)

    await vi.advanceTimersByTimeAsync(200)

    expect(save).toHaveBeenCalledWith({ title: 'Published title' })
    expect(autosave.pending.value).toBe(false)
    expect(autosave.savedAt.value).toBeInstanceOf(Date)

    scope.stop()
    vi.useRealTimers()
  })
})
