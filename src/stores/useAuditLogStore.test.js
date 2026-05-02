import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const auditAPI = {
  listAuditLogs: vi.fn(),
}

vi.mock('@/api', () => ({
  auditAPI,
}))

describe('useAuditLogStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    auditAPI.listAuditLogs.mockReset()
  })

  it('loads audit logs with compact filters and server pagination', async () => {
    const { useAuditLogStore } = await import('./useAuditLogStore')
    const store = useAuditLogStore()

    auditAPI.listAuditLogs.mockResolvedValue({
      items: [{ auditLogId: 'aud-001', action: 'message.delete' }],
      page: 2,
      limit: 10,
      total: 1,
      totalPages: 1,
    })

    store.setFilters({
      userId: 'user-001',
      action: 'message.delete',
      resourceType: 'message',
      resourceId: 'msg-001',
    })
    await store.fetchAuditLogs({ page: 2, limit: 10 })

    expect(auditAPI.listAuditLogs).toHaveBeenCalledWith({
      userId: 'user-001',
      action: 'message.delete',
      resourceType: 'message',
      resourceId: 'msg-001',
      page: 2,
      limit: 10,
    })
    expect(store.entries).toHaveLength(1)
    expect(store.pagination.total).toBe(1)
  })

  it('redacts top-level PII unless the current role is system admin', async () => {
    const { useAuditLogStore, redactAuditEntry } = await import('./useAuditLogStore')
    const store = useAuditLogStore()

    const rawEntry = {
      auditLogId: 'aud-001',
      action: 'user.session.refresh',
      ip: '127.0.0.1',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    }

    auditAPI.listAuditLogs.mockResolvedValue({
      items: [rawEntry],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    })

    await store.fetchAuditLogs()

    expect(store.entries[0].ip).toBe('[redacted]')
    expect(store.entries[0].ipAddress).toBe('[redacted]')
    expect(store.entries[0].userAgent).toBe('[redacted]')
    expect(
      redactAuditEntry(rawEntry, {
        roles: ['system admin'],
      }).userAgent,
    ).toBe('Mozilla/5.0')
  })

  it('rejects partial resource filters before calling the API', async () => {
    const { useAuditLogStore } = await import('./useAuditLogStore')
    const store = useAuditLogStore()

    store.setFilters({ resourceType: 'message', resourceId: '' })

    await expect(store.fetchAuditLogs()).rejects.toThrow(
      'resourceType and resourceId must be provided together.',
    )
    expect(auditAPI.listAuditLogs).not.toHaveBeenCalled()
  })
})
