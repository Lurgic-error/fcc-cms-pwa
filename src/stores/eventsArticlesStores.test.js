import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
}))

const eventsAPI = {
  listEvents: vi.fn(),
  submitEventForApproval: vi.fn(),
  scheduleEventPublish: vi.fn(),
  cancelEventPublishSchedule: vi.fn(),
  deleteEvents: vi.fn(),
}

const articlesAPI = {
  listArticles: vi.fn(),
  submitArticleForApproval: vi.fn(),
  scheduleArticlePublish: vi.fn(),
  cancelArticlePublishSchedule: vi.fn(),
  deleteArticles: vi.fn(),
}

vi.mock('@/api', () => ({
  eventsAPI,
  articlesAPI,
}))

describe('events and articles workflow stores', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    push.mockReset()

    Object.values(eventsAPI).forEach((fn) => fn.mockReset())
    Object.values(articlesAPI).forEach((fn) => fn.mockReset())
  })

  it('maps event submit and scheduling aliases to the API layer', async () => {
    const { useEventsStore } = await import('./useEventsStore')
    const store = useEventsStore()

    eventsAPI.submitEventForApproval.mockResolvedValue({
      event: { eventId: 'evt-001', publicationStatus: 'submitted' },
    })
    eventsAPI.listEvents.mockResolvedValue({
      items: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    })
    eventsAPI.scheduleEventPublish.mockResolvedValue({
      event: { eventId: 'evt-001', publicationStatus: 'scheduled' },
    })
    eventsAPI.cancelEventPublishSchedule.mockResolvedValue({
      event: { eventId: 'evt-001', publicationStatus: 'approved' },
    })
    eventsAPI.deleteEvents.mockResolvedValue({ deleted: 1 })

    await store.submit('evt-001')
    await store.schedulePublish('evt-001', {
      scheduledPublishAt: '2026-03-20T08:00:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    })
    await store.cancelPublishSchedule('evt-001')
    await store.bulkRemove(['evt-001'])

    expect(eventsAPI.submitEventForApproval).toHaveBeenCalledWith({ eventId: 'evt-001' })
    expect(eventsAPI.scheduleEventPublish).toHaveBeenCalledWith({
      eventId: 'evt-001',
      scheduledPublishAt: '2026-03-20T08:00:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    })
    expect(eventsAPI.cancelEventPublishSchedule).toHaveBeenCalledWith({ eventId: 'evt-001' })
    expect(eventsAPI.deleteEvents).toHaveBeenCalledWith({ ids: ['evt-001'] })
  })

  it('maps article submit and scheduling aliases to the API layer', async () => {
    const { useArticlesStore } = await import('./useArticlesStore')
    const store = useArticlesStore()

    articlesAPI.submitArticleForApproval.mockResolvedValue({
      article: { articleId: 'art-001', publicationStatus: 'submitted' },
    })
    articlesAPI.listArticles.mockResolvedValue({
      items: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    })
    articlesAPI.scheduleArticlePublish.mockResolvedValue({
      article: { articleId: 'art-001', publicationStatus: 'scheduled' },
    })
    articlesAPI.cancelArticlePublishSchedule.mockResolvedValue({
      article: { articleId: 'art-001', publicationStatus: 'approved' },
    })
    articlesAPI.deleteArticles.mockResolvedValue({ deleted: 1 })

    await store.submit('art-001')
    await store.schedulePublish('art-001', {
      scheduledPublishAt: '2026-03-20T08:00:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    })
    await store.cancelPublishSchedule('art-001')
    await store.bulkRemove(['art-001'])

    expect(articlesAPI.submitArticleForApproval).toHaveBeenCalledWith({ articleId: 'art-001' })
    expect(articlesAPI.scheduleArticlePublish).toHaveBeenCalledWith({
      articleId: 'art-001',
      scheduledPublishAt: '2026-03-20T08:00:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    })
    expect(articlesAPI.cancelArticlePublishSchedule).toHaveBeenCalledWith({
      articleId: 'art-001',
    })
    expect(articlesAPI.deleteArticles).toHaveBeenCalledWith({ ids: ['art-001'] })
  })
})
