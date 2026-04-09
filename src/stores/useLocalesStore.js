import { localesAPI } from '@/api'
import { createWorkflowEntityStore } from '@/stores/_shared/createWorkflowEntityStore'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

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

  async function listActive() {
    const res = await localesAPI.listActive()
    if (res?.error) throw new Error(res.error)
    activeLocales.value = res?.locales || []
    return activeLocales.value
  }

  async function resolveFallbackChain(locale) {
    const res = await localesAPI.resolveFallbackChain(locale)
    if (res?.error) throw new Error(res.error)

    fallbackRequestedLocale.value = res?.requestedLocale || null
    fallbackChain.value = res?.fallbackChain || []
    return fallbackChain.value
  }

  async function setDefault(localeId) {
    const res = await localesAPI.setDefault(localeId)
    if (res?.error) throw new Error(res.error)
    await listActive()
    return res?.locale || res
  }

  async function setActive(localeId, isActive) {
    const res = await localesAPI.setActive(localeId, isActive)
    if (res?.error) throw new Error(res.error)
    await listActive()
    return res?.locale || res
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
