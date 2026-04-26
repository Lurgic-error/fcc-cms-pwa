import { localesAPI } from '@/api'
import { createWorkflowEntityStore } from '@/stores/_shared/createWorkflowEntityStore'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { withWorkflowState, withWorkflowStateList } from '@/utils/contentWorkflow'

export const useLocalesStore = defineStore('cms-locales', () => {
  const base = createWorkflowEntityStore({
    api: localesAPI,
    idField: 'localeId',
    entityKey: 'locale',
    collectionKeys: ['locales'],
  })

  const activeLocales = ref([])
  const fallbackChain = ref([])
  const fallbackRequestedLocale = ref(null)

  const defaultLocale = computed(() => {
    return activeLocales.value.find((locale) => locale?.isDefault) || null
  })

  function applyActiveLocales(nextLocales = []) {
    activeLocales.value = withWorkflowStateList(nextLocales)
    return activeLocales.value
  }

  function syncLocaleState(nextLocale = {}, { ensureSingleDefault = false } = {}) {
    const normalized = withWorkflowState(nextLocale)
    const nextId = normalized?.localeId

    const updateLocaleList = (list = []) =>
      withWorkflowStateList(
        list.map((item) => {
          if (ensureSingleDefault && normalized.isDefault && item?.localeId !== nextId) {
            return { ...item, isDefault: false }
          }

          return item?.localeId === nextId ? normalized : item
        }),
      )

    if (Array.isArray(base.entities.value) && base.entities.value.length) {
      base.setEntitiesState(updateLocaleList(base.entities.value))
    }

    if (Array.isArray(activeLocales.value) && activeLocales.value.length) {
      activeLocales.value = updateLocaleList(activeLocales.value)
    }

    if (base.entity.value?.localeId === nextId) {
      base.syncEntity(normalized)
    }

    return normalized
  }

  async function listActive() {
    return base.withAsync(async () => {
      const res = await localesAPI.listActive()
      if (res?.error) base.handleError(res)
      return applyActiveLocales(res?.locales || [])
    })
  }

  async function resolveFallbackChain(locale) {
    return base.withAsync(async () => {
      const res = await localesAPI.resolveFallbackChain(locale)
      if (res?.error) base.handleError(res)

      fallbackRequestedLocale.value = res?.requestedLocale || null
      fallbackChain.value = res?.fallbackChain || []
      return fallbackChain.value
    })
  }

  async function setDefault(localeId) {
    return base.withAsync(async () => {
      const res = await localesAPI.setDefault(localeId)
      if (res?.error) base.handleError(res)

      const nextLocale = res?.locale || res
      syncLocaleState(nextLocale, { ensureSingleDefault: true })
      await listActive()
      return nextLocale
    })
  }

  async function setActive(localeId, isActive) {
    return base.withAsync(async () => {
      const res = await localesAPI.setActive(localeId, isActive)
      if (res?.error) base.handleError(res)

      const nextLocale = res?.locale || res
      syncLocaleState(nextLocale)
      await listActive()
      return nextLocale
    })
  }

  return {
    ...base,
    activeLocales,
    defaultLocale,
    fallbackChain,
    fallbackRequestedLocale,
    listActive,
    resolveFallbackChain,
    setDefault,
    setActive,
  }
})
