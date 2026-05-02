import { describe, expect, it, vi } from 'vitest'

import { buildEditorialEntityApi, createEditorialCollectionApi } from './editorialEntityApi'

function createRequestDouble() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}

describe('editorialEntityApi envelope handling', () => {
  it('normalizes collection payloads from the standard server envelope', async () => {
    const request = createRequestDouble()
    request.get.mockResolvedValue({
      data: {
        data: {
          events: [{ eventId: 'evt-001' }],
          pagination: { page: 2, limit: 10, total: 11, totalPages: 2 },
        },
        error: null,
      },
    })
    const api = createEditorialCollectionApi({
      request,
      baseUrl: '/events',
      collectionKey: 'events',
    })

    const response = await api.list({ page: 2, limit: 10 })

    expect(response.items).toEqual([{ eventId: 'evt-001' }])
    expect(response.events).toEqual([{ eventId: 'evt-001' }])
    expect(response.page).toBe(2)
    expect(response.totalPages).toBe(2)
  })

  it('unwraps mutation responses from the standard server envelope', async () => {
    const request = createRequestDouble()
    request.put.mockResolvedValue({
      data: {
        data: { eventId: 'evt-001', status: 'pending_review' },
        error: null,
      },
    })
    const api = buildEditorialEntityApi({ request, baseUrl: '/events' })

    await expect(api.submit('evt-001')).resolves.toEqual({
      eventId: 'evt-001',
      status: 'pending_review',
    })
  })

  it('returns legacy error results for structured envelope failures', async () => {
    const request = createRequestDouble()
    request.put.mockRejectedValue({
      response: {
        data: {
          data: null,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Title is required.',
            details: { field: 'title' },
          },
        },
      },
    })
    const api = buildEditorialEntityApi({ request, baseUrl: '/events' })

    await expect(api.submit('evt-001')).resolves.toMatchObject({
      error: 'Title is required.',
      errorCode: 'VALIDATION_FAILED',
      errorDetails: { field: 'title' },
    })
  })
})
