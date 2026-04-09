import { describe, expect, it, vi } from 'vitest'

import makeArticlesAPI from './blogAPI'
import makeEventsAPI from './eventsAPI'

function createRequestDouble() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}

describe('events and articles API workflow endpoints', () => {
  it('builds event lifecycle requests and normalizes event collections', async () => {
    const request = createRequestDouble()
    request.get.mockResolvedValue({
      data: {
        data: [{ eventId: 'evt-001' }],
        pagination: { page: 2, limit: 10, total: 11, totalPages: 2 },
      },
    })
    request.put.mockResolvedValue({ data: { ok: true } })
    request.delete.mockResolvedValue({ data: { ok: true } })
    const api = makeEventsAPI({ request })

    const listResponse = await api.listEvents({ page: 2, limit: 10 })
    await api.submitEventForApproval({ eventId: 'evt-001' })
    await api.approveEvent({ eventId: 'evt-001' })
    await api.rejectEvent({ eventId: 'evt-001', reason: 'Needs revisions' })
    await api.publishEvent({ eventId: 'evt-001' })
    await api.unpublishEvent({ eventId: 'evt-001' })
    await api.scheduleEventPublish({
      eventId: 'evt-001',
      scheduledPublishAt: '2026-03-20T08:00:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    })
    await api.scheduleEventUnpublish({
      eventId: 'evt-001',
      scheduledUnpublishAt: '2026-03-21T08:00:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    })
    await api.archiveEvent({ eventId: 'evt-001', reason: 'Archive note' })
    await api.restoreArchivedEvent({ eventId: 'evt-001' })
    await api.softDeleteEvent({ eventId: 'evt-001', reason: 'Delete note' })
    await api.restoreEvent({ eventId: 'evt-001' })
    await api.deleteEvent({ eventId: 'evt-001' })

    expect(listResponse.items).toEqual([{ eventId: 'evt-001' }])
    expect(listResponse.page).toBe(2)
    expect(request.put).toHaveBeenNthCalledWith(1, '/events/evt-001/submit')
    expect(request.put).toHaveBeenNthCalledWith(2, '/events/evt-001/approve')
    expect(request.put).toHaveBeenNthCalledWith(3, '/events/evt-001/reject', {
      reason: 'Needs revisions',
    })
    expect(request.put).toHaveBeenNthCalledWith(4, '/events/evt-001/publish')
    expect(request.put).toHaveBeenNthCalledWith(5, '/events/evt-001/unpublish')
    expect(request.put).toHaveBeenNthCalledWith(6, '/events/evt-001/schedule-publish', {
      scheduledPublishAt: '2026-03-20T08:00:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    })
    expect(request.put).toHaveBeenNthCalledWith(7, '/events/evt-001/schedule-unpublish', {
      scheduledUnpublishAt: '2026-03-21T08:00:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    })
    expect(request.put).toHaveBeenNthCalledWith(8, '/events/evt-001/archive', {
      reason: 'Archive note',
    })
    expect(request.put).toHaveBeenNthCalledWith(9, '/events/evt-001/restore-archive')
    expect(request.put).toHaveBeenNthCalledWith(10, '/events/evt-001/soft-delete', {
      reason: 'Delete note',
    })
    expect(request.put).toHaveBeenNthCalledWith(11, '/events/evt-001/restore')
    expect(request.delete).toHaveBeenCalledWith('/events/evt-001/delete')
  })

  it('builds article lifecycle requests and normalizes article collections', async () => {
    const request = createRequestDouble()
    request.get.mockResolvedValue({
      data: {
        articles: [{ articleId: 'art-001' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    })
    request.put.mockResolvedValue({ data: { ok: true } })
    request.delete.mockResolvedValue({ data: { ok: true } })
    const api = makeArticlesAPI({ request })

    const listResponse = await api.listArticles({ page: 1, limit: 20 })
    await api.submitArticleForApproval({ articleId: 'art-001' })
    await api.approveArticle({ articleId: 'art-001' })
    await api.rejectArticle({ articleId: 'art-001', reason: 'Needs revisions' })
    await api.publishArticle({ articleId: 'art-001' })
    await api.unpublishArticle({ articleId: 'art-001' })
    await api.scheduleArticlePublish({
      articleId: 'art-001',
      scheduledPublishAt: '2026-03-20T08:00:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    })
    await api.scheduleArticleUnpublish({
      articleId: 'art-001',
      scheduledUnpublishAt: '2026-03-21T08:00:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    })
    await api.archiveArticle({ articleId: 'art-001', reason: 'Archive note' })
    await api.restoreArchivedArticle({ articleId: 'art-001' })
    await api.softDeleteArticle({ articleId: 'art-001', reason: 'Delete note' })
    await api.restoreArticle({ articleId: 'art-001' })
    await api.deleteArticle({ articleId: 'art-001' })

    expect(listResponse.items).toEqual([{ articleId: 'art-001' }])
    expect(request.put).toHaveBeenNthCalledWith(1, '/articles/art-001/submit')
    expect(request.put).toHaveBeenNthCalledWith(2, '/articles/art-001/approve')
    expect(request.put).toHaveBeenNthCalledWith(3, '/articles/art-001/reject', {
      reason: 'Needs revisions',
    })
    expect(request.put).toHaveBeenNthCalledWith(4, '/articles/art-001/publish')
    expect(request.put).toHaveBeenNthCalledWith(5, '/articles/art-001/unpublish')
    expect(request.put).toHaveBeenNthCalledWith(6, '/articles/art-001/schedule-publish', {
      scheduledPublishAt: '2026-03-20T08:00:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    })
    expect(request.put).toHaveBeenNthCalledWith(7, '/articles/art-001/schedule-unpublish', {
      scheduledUnpublishAt: '2026-03-21T08:00:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    })
    expect(request.put).toHaveBeenNthCalledWith(8, '/articles/art-001/archive', {
      reason: 'Archive note',
    })
    expect(request.put).toHaveBeenNthCalledWith(9, '/articles/art-001/restore-archive')
    expect(request.put).toHaveBeenNthCalledWith(10, '/articles/art-001/soft-delete', {
      reason: 'Delete note',
    })
    expect(request.put).toHaveBeenNthCalledWith(11, '/articles/art-001/restore')
    expect(request.delete).toHaveBeenCalledWith('/articles/art-001/delete')
  })
})
