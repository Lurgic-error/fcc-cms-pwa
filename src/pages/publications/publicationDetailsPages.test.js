import { flushPromises, mount } from '@vue/test-utils'
import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const routeState = {
  params: {},
}

const push = vi.fn()
const fetchOne = vi.fn(async () => {})
const runWorkflow = vi.fn(async () => {})
const executeRecordAction = vi.fn(async () => false)
const getRecordActions = vi.fn(() => [])
const findCategory = vi.fn(async () => null)
const listPublications = vi.fn(async () => ({
  publications: [],
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
}))
const searchPublications = vi.fn(async () => ({
  publications: [],
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
}))

const entity = ref(null)
const loading = ref(false)
const error = ref('')

vi.mock('vue-router', () => ({
  useRoute: () => routeState,
  useRouter: () => ({
    push,
  }),
}))

vi.mock('@/modules/crud/resourceConfigs', () => ({
  getResourceConfig: (key) => {
    if (key === 'publications') {
      return {
        idKey: 'publicationId',
        routeParam: 'publicationId',
        routes: {
          list: 'publications.list',
          details: 'publications.details',
          edit: 'publications.edit',
          response: 'publications.response',
        },
        detailFields: [],
        columns: [],
        adapter: {
          getId: (record) => record?.publicationId || '',
        },
      }
    }

    return {
      idKey: 'categoryId',
      routeParam: 'categoryId',
      routes: {
        list: 'publicationCategories.list',
        details: 'publicationCategories.details',
        edit: 'publicationCategories.edit',
        response: 'publicationCategories.response',
      },
      detailFields: [],
      columns: [],
      adapter: {
        getId: (record) => record?.categoryId || '',
      },
    }
  },
}))

vi.mock('@/composables/useEntityCrud', () => ({
  useEntityCrud: () => ({
    entity,
    loading,
    error,
    fetchOne,
    runWorkflow,
  }),
}))

vi.mock('@/composables/useEditorialActions', () => ({
  useEditorialActions: () => ({
    executeRecordAction,
    getRecordActions,
  }),
}))

vi.mock('@/stores/publications/usePublicationCategoriesStore', () => ({
  usePublicationCategoriesStore: () => ({
    findCategory,
  }),
}))

vi.mock('@/composables/useRouteAccess', () => ({
  useRouteAccess: () => ({
    canAccessRoute: () => true,
  }),
}))

vi.mock('@/api', () => ({
  publicationsAPI: {
    listPublications,
    searchPublications,
  },
}))

const globalStubs = {
  PageWrapper: {
    template: '<div><slot name="header" /><slot /></div>',
  },
  AppBentoGrid: {
    template: '<div><slot /></div>',
  },
  EntityDetailsPanel: {
    template: '<div><slot /></div>',
  },
  EntityTable: {
    template: '<div />',
  },
  TablePagination: {
    template: '<div />',
  },
  StatusBadge: {
    template: '<span />',
  },
  EntityActionsDropdown: {
    props: ['actions'],
    emits: ['select'],
    template:
      '<div class="el-button el-button--default" data-test="actions-trigger" role="button" tabindex="0" @click="$emit(\'select\', actions[0])">Actions</div>',
  },
  ElButton: {
    emits: ['click'],
    template:
      '<div class="el-button el-button--default" role="button" tabindex="0" @click="$emit(\'click\', $event)"><slot /></div>',
  },
  ElAlert: {
    template: '<div><slot /></div>',
  },
  ElCard: {
    template: '<div><slot name="header" /><slot /></div>',
  },
  ElTag: {
    template: '<span><slot /></span>',
  },
}

describe('publication detail action wiring', () => {
  beforeEach(() => {
    routeState.params = {}
    entity.value = null
    loading.value = false
    error.value = ''
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      configurable: true,
    })
    push.mockReset()
    fetchOne.mockClear()
    runWorkflow.mockClear()
    executeRecordAction.mockReset()
    getRecordActions.mockReset()
    findCategory.mockReset()
    listPublications.mockClear()
    searchPublications.mockClear()
  })

  it('loads the assigned category and routes delete actions back to the publications list', async () => {
    routeState.params = { publicationId: 'pub-001' }
    entity.value = {
      publicationId: 'pub-001',
      name: { en: 'Annual Market Report' },
      category: { categoryId: 'cat-001' },
      publicationStatus: 'submitted',
    }
    getRecordActions.mockReturnValue([{ key: 'delete', label: 'Delete Permanently' }])
    executeRecordAction.mockResolvedValue(true)
    findCategory.mockResolvedValue({
      categoryId: 'cat-001',
      publicationStatus: 'published',
    })

    const { default: PublicationDetailsPage } = await import('./PublicationDetailsPage.vue')
    const wrapper = mount(PublicationDetailsPage, {
      global: {
        stubs: globalStubs,
      },
    })

    await flushPromises()

    expect(fetchOne).toHaveBeenCalledWith('pub-001')
    expect(findCategory).toHaveBeenCalledWith('cat-001')

    await wrapper.get('[data-test="actions-trigger"]').trigger('click')

    expect(executeRecordAction).toHaveBeenCalledWith(
      { key: 'delete', label: 'Delete Permanently' },
      entity.value,
      expect.objectContaining({
        runWorkflow,
        reload: expect.any(Function),
      }),
    )
    expect(push).toHaveBeenCalledWith({ name: 'publications.list' })
  })

  it('loads linked publications for category details and routes delete actions back to the category list', async () => {
    routeState.params = { categoryId: 'cat-001' }
    entity.value = {
      categoryId: 'cat-001',
      name: { en: 'Reports' },
      publicationStatus: 'submitted',
    }
    getRecordActions.mockReturnValue([{ key: 'delete', label: 'Delete Permanently' }])
    executeRecordAction.mockResolvedValue(true)

    const { default: PublicationCategoryDetailsPage } =
      await import('./PublicationCategoryDetailsPage.vue')
    const wrapper = mount(PublicationCategoryDetailsPage, {
      global: {
        stubs: globalStubs,
      },
    })

    await flushPromises()

    expect(fetchOne).toHaveBeenCalledWith('cat-001')
    expect(listPublications).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: 'cat-001',
      }),
    )

    await wrapper.get('[data-test="actions-trigger"]').trigger('click')

    expect(executeRecordAction).toHaveBeenCalledWith(
      { key: 'delete', label: 'Delete Permanently' },
      entity.value,
      expect.objectContaining({
        runWorkflow,
        reload: expect.any(Function),
      }),
    )
    expect(push).toHaveBeenCalledWith({ name: 'publicationCategories.list' })
  })
})
