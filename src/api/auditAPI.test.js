import { describe, expect, it, vi } from 'vitest'

import makeAuditAPI, { compactAuditQuery, normalizeAuditListPayload } from './auditAPI'

describe('auditAPI', () => {
  it('serializes the single filtered audit endpoint query', async () => {
    const request = {
      get: vi.fn().mockResolvedValue({
        data: {
          data: {
            items: [{ action: 'message.delete' }],
            pagination: { page: 2, limit: 10, total: 1, totalPages: 1 },
          },
          error: null,
        },
      }),
    }
    const api = makeAuditAPI({ request })

    const response = await api.listAuditLogs({
      userId: ' user-001 ',
      action: 'message.delete',
      resourceType: 'message',
      resourceId: 'msg-001',
      page: 2,
      limit: 10,
      actor: '',
    })

    expect(request.get).toHaveBeenCalledWith('/admin/audit', {
      params: {
        userId: 'user-001',
        action: 'message.delete',
        resourceType: 'message',
        resourceId: 'msg-001',
        page: 2,
        limit: 10,
      },
    })
    expect(response.items).toEqual([{ action: 'message.delete' }])
    expect(response.page).toBe(2)
    expect(response.totalPages).toBe(1)
  })

  it('drops empty filters without dropping numeric pagination', () => {
    expect(
      compactAuditQuery({
        userId: '',
        action: '  ',
        resourceType: null,
        resourceId: undefined,
        page: 1,
        limit: 0,
      }),
    ).toEqual({ page: 1, limit: 0 })
  })

  it('normalizes enveloped and legacy audit list payloads', () => {
    const enveloped = {
      data: {
        items: [{ action: 'user.login' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
      error: null,
    }
    const legacy = {
      auditLogs: [{ action: 'user.logout' }],
      page: 3,
      limit: 5,
      total: 11,
      totalPages: 3,
    }

    expect(normalizeAuditListPayload(enveloped).items).toEqual([{ action: 'user.login' }])
    expect(normalizeAuditListPayload(legacy).items).toEqual([{ action: 'user.logout' }])
  })
})
