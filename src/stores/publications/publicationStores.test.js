import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
}))

const publicationsAPI = {
  submitPublicationForApproval: vi.fn(),
  cancelPublicationPublishSchedule: vi.fn(),
  submitPublicationCategoryForApproval: vi.fn(),
}

vi.mock('@/api', () => ({
  publicationsAPI,
}))

describe('publication workflow stores', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    push.mockReset()
    publicationsAPI.submitPublicationForApproval.mockReset()
    publicationsAPI.cancelPublicationPublishSchedule.mockReset()
    publicationsAPI.submitPublicationCategoryForApproval.mockReset()
  })

  it('maps publication submit and cancel publish schedule aliases to the API layer', async () => {
    const { usePublicationsStore } = await import('./usePublicationsStore')
    const store = usePublicationsStore()

    publicationsAPI.submitPublicationForApproval.mockResolvedValue({
      publication: { publicationId: 'pub-001', publicationStatus: 'submitted' },
    })
    publicationsAPI.cancelPublicationPublishSchedule.mockResolvedValue({
      publication: { publicationId: 'pub-001', publicationStatus: 'approved' },
    })

    await store.submit('pub-001')
    await store.cancelPublishSchedule('pub-001')

    expect(publicationsAPI.submitPublicationForApproval).toHaveBeenCalledWith({
      publicationId: 'pub-001',
    })
    expect(publicationsAPI.cancelPublicationPublishSchedule).toHaveBeenCalledWith({
      publicationId: 'pub-001',
    })
  })

  it('maps the publication category submit alias to the category submit endpoint', async () => {
    const { usePublicationCategoriesStore } = await import('./usePublicationCategoriesStore')
    const store = usePublicationCategoriesStore()

    publicationsAPI.submitPublicationCategoryForApproval.mockResolvedValue({
      category: { categoryId: 'cat-001', publicationStatus: 'submitted' },
    })

    await store.submit('cat-001')

    expect(publicationsAPI.submitPublicationCategoryForApproval).toHaveBeenCalledWith({
      categoryId: 'cat-001',
    })
  })
})
