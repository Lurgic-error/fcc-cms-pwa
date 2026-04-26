import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const localesAPI = {
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
  listActive: vi.fn(),
  resolveFallbackChain: vi.fn(),
  setDefault: vi.fn(),
  setActive: vi.fn(),
}

vi.mock('@/api', () => ({
  localesAPI,
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('useLocalesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    Object.values(localesAPI).forEach((fn) => fn.mockReset())
  })

  it('surfaces listActive failures through the shared async state', async () => {
    const { useLocalesStore } = await import('./useLocalesStore')
    const store = useLocalesStore()

    localesAPI.listActive.mockResolvedValue({ error: 'No active locales available.' })

    await expect(store.listActive()).rejects.toThrow('No active locales available.')
    expect(store.error).toBe('No active locales available.')
  })

  it('refreshes active locale state after default and active toggles', async () => {
    const { useLocalesStore } = await import('./useLocalesStore')
    const store = useLocalesStore()

    localesAPI.listActive.mockResolvedValueOnce({
      locales: [{ localeId: 'sw', code: 'sw', isDefault: true, isActive: true }],
    })

    await store.listActive()
    expect(store.defaultLocale.localeId).toBe('sw')

    localesAPI.setDefault.mockResolvedValue({
      locale: { localeId: 'en', code: 'en', isDefault: true, isActive: true },
    })
    localesAPI.listActive.mockResolvedValueOnce({
      locales: [
        { localeId: 'sw', code: 'sw', isDefault: false, isActive: true },
        { localeId: 'en', code: 'en', isDefault: true, isActive: true },
      ],
    })

    await store.setDefault('en')

    expect(store.defaultLocale.localeId).toBe('en')

    localesAPI.setActive.mockResolvedValue({
      locale: { localeId: 'en', code: 'en', isDefault: true, isActive: false },
    })
    localesAPI.listActive.mockResolvedValueOnce({
      locales: [{ localeId: 'sw', code: 'sw', isDefault: false, isActive: true }],
    })

    await store.setActive('en', false)

    expect(store.activeLocales.map((locale) => locale.localeId)).toEqual(['sw'])
  })
})
