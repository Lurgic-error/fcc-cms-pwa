import { describe, expect, it, vi } from 'vitest'

import makePublicationsAPI from './publicationsAPI'

function createRequestDouble() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}

describe('publicationsAPI workflow endpoints', () => {
  it('builds publication lifecycle requests with the correct method, route, and payload', async () => {
    const request = createRequestDouble()
    request.put.mockResolvedValue({ data: { ok: true } })
    request.delete.mockResolvedValue({ data: { ok: true } })
    const api = makePublicationsAPI({ request })

    await api.submitPublicationForApproval({ publicationId: 'pub-001' })
    await api.approvePublication({ publicationId: 'pub-001' })
    await api.rejectPublication({ publicationId: 'pub-001', reason: 'Needs revision' })
    await api.publishPublication({ publicationId: 'pub-001' })
    await api.unpublishPublication({ publicationId: 'pub-001' })
    await api.schedulePublicationPublish({
      publicationId: 'pub-001',
      scheduledPublishAt: '2026-03-20T08:00:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    })
    await api.schedulePublicationUnpublish({
      publicationId: 'pub-001',
      scheduledUnpublishAt: '2026-03-21T08:00:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    })
    await api.archivePublication({ publicationId: 'pub-001', reason: 'Archived for retention' })
    await api.restoreArchivedPublication({ publicationId: 'pub-001' })
    await api.softDeletePublication({ publicationId: 'pub-001', reason: 'Deleted in error' })
    await api.restorePublication({ publicationId: 'pub-001' })
    await api.deletePublication({ publicationId: 'pub-001' })

    expect(request.put).toHaveBeenNthCalledWith(1, '/publications/pub-001/submit')
    expect(request.put).toHaveBeenNthCalledWith(2, '/publications/pub-001/approve')
    expect(request.put).toHaveBeenNthCalledWith(3, '/publications/pub-001/reject', {
      reason: 'Needs revision',
    })
    expect(request.put).toHaveBeenNthCalledWith(4, '/publications/pub-001/publish')
    expect(request.put).toHaveBeenNthCalledWith(5, '/publications/pub-001/unpublish')
    expect(request.put).toHaveBeenNthCalledWith(6, '/publications/pub-001/schedule-publish', {
      scheduledPublishAt: '2026-03-20T08:00:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    })
    expect(request.put).toHaveBeenNthCalledWith(7, '/publications/pub-001/schedule-unpublish', {
      scheduledUnpublishAt: '2026-03-21T08:00:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    })
    expect(request.put).toHaveBeenNthCalledWith(8, '/publications/pub-001/archive', {
      reason: 'Archived for retention',
    })
    expect(request.put).toHaveBeenNthCalledWith(9, '/publications/pub-001/restore-archive')
    expect(request.put).toHaveBeenNthCalledWith(10, '/publications/pub-001/soft-delete', {
      reason: 'Deleted in error',
    })
    expect(request.put).toHaveBeenNthCalledWith(11, '/publications/pub-001/restore')
    expect(request.delete).toHaveBeenCalledWith('/publications/pub-001/delete')
  })

  it('builds publication category lifecycle requests with the correct method, route, and payload', async () => {
    const request = createRequestDouble()
    request.put.mockResolvedValue({ data: { ok: true } })
    request.delete.mockResolvedValue({ data: { ok: true } })
    const api = makePublicationsAPI({ request })

    await api.submitPublicationCategoryForApproval({ categoryId: 'cat-001' })
    await api.approvePublicationCategory({ categoryId: 'cat-001' })
    await api.rejectPublicationCategory({ categoryId: 'cat-001', reason: 'Needs revision' })
    await api.publishCategory({ categoryId: 'cat-001' })
    await api.unpublishCategory({ categoryId: 'cat-001' })
    await api.schedulePublicationCategoryPublish({
      categoryId: 'cat-001',
      scheduledPublishAt: '2026-03-20T08:00:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    })
    await api.schedulePublicationCategoryUnpublish({
      categoryId: 'cat-001',
      scheduledUnpublishAt: '2026-03-21T08:00:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    })
    await api.archiveCategory({ categoryId: 'cat-001', reason: 'Archived for retention' })
    await api.restoreArchivedCategory({ categoryId: 'cat-001' })
    await api.softDeleteCategory({ categoryId: 'cat-001', reason: 'Deleted in error' })
    await api.restoreCategory({ categoryId: 'cat-001' })
    await api.deletePublicationCategory({ categoryId: 'cat-001' })

    expect(request.put).toHaveBeenNthCalledWith(1, '/publications/categories/cat-001/submit')
    expect(request.put).toHaveBeenNthCalledWith(2, '/publications/categories/cat-001/approve')
    expect(request.put).toHaveBeenNthCalledWith(3, '/publications/categories/cat-001/reject', {
      reason: 'Needs revision',
    })
    expect(request.put).toHaveBeenNthCalledWith(4, '/publications/categories/cat-001/publish')
    expect(request.put).toHaveBeenNthCalledWith(5, '/publications/categories/cat-001/unpublish')
    expect(request.put).toHaveBeenNthCalledWith(
      6,
      '/publications/categories/cat-001/schedule-publish',
      {
        scheduledPublishAt: '2026-03-20T08:00:00.000Z',
        timezone: 'Africa/Dar_es_Salaam',
      },
    )
    expect(request.put).toHaveBeenNthCalledWith(
      7,
      '/publications/categories/cat-001/schedule-unpublish',
      {
        scheduledUnpublishAt: '2026-03-21T08:00:00.000Z',
        timezone: 'Africa/Dar_es_Salaam',
      },
    )
    expect(request.put).toHaveBeenNthCalledWith(8, '/publications/categories/cat-001/archive', {
      reason: 'Archived for retention',
    })
    expect(request.put).toHaveBeenNthCalledWith(
      9,
      '/publications/categories/cat-001/restore-archive',
    )
    expect(request.put).toHaveBeenNthCalledWith(
      10,
      '/publications/categories/cat-001/soft-delete',
      {
        reason: 'Deleted in error',
      },
    )
    expect(request.put).toHaveBeenNthCalledWith(11, '/publications/categories/cat-001/restore')
    expect(request.delete).toHaveBeenCalledWith('/publications/categories/cat-001/delete')
  })
})
