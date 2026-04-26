import { createPinia, defineStore, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createWorkflowEntityStore } from './_shared/createWorkflowEntityStore'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
}))

function createApiDouble() {
  return {
    list: vi.fn(),
    find: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    softDelete: vi.fn(),
    restore: vi.fn(),
    submit: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    publish: vi.fn(),
    unpublish: vi.fn(),
    archive: vi.fn(),
    restoreArchived: vi.fn(),
    listPublished: vi.fn(),
    listArchived: vi.fn(),
  }
}

describe('createWorkflowEntityStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    push.mockReset()
  })

  it('keeps the active list mode and query when removing from an archived list', async () => {
    const api = createApiDouble()
    const useTestStore = defineStore('workflow-entity-remove', () =>
      createWorkflowEntityStore({
        api,
        idField: 'recordId',
        entityKey: 'record',
        collectionKeys: ['records'],
        detailsRouteName: 'records.details',
      }),
    )

    api.listArchived.mockResolvedValueOnce({
      records: [{ recordId: 'rec-001', isArchived: true }],
      page: 3,
      limit: 10,
      total: 1,
      totalPages: 1,
    })
    api.remove.mockResolvedValue({ deleted: 1 })
    api.listArchived.mockResolvedValueOnce({
      records: [],
      page: 3,
      limit: 10,
      total: 0,
      totalPages: 1,
    })

    const store = useTestStore()

    await store.listArchived({ page: 3, limit: 10 })
    await store.remove('rec-001')

    expect(store.currentListMode).toBe('archived')
    expect(api.listArchived).toHaveBeenNthCalledWith(2, { page: 3, limit: 10 })
    expect(store.entities).toEqual([])
  })

  it('removes restored archived records from the active archived collection and normalizes state', async () => {
    const api = createApiDouble()
    const useTestStore = defineStore('workflow-entity-restore', () =>
      createWorkflowEntityStore({
        api,
        idField: 'recordId',
        entityKey: 'record',
        collectionKeys: ['records'],
      }),
    )

    api.listArchived.mockResolvedValue({
      records: [{ recordId: 'rec-002', isArchived: true }],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    })
    api.restoreArchived.mockResolvedValue({
      record: { recordId: 'rec-002', published: true },
    })

    const store = useTestStore()

    await store.listArchived()
    await store.restoreArchived('rec-002')

    expect(store.entity.effectiveStatus).toBe('published')
    expect(store.entities).toEqual([])
    expect(store.archivedEntities).toEqual([])
  })
})
