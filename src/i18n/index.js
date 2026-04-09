import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import sw from './locales/sw.json'

export const LOCALE_STORAGE_KEY = 'fcc-cms-locale'
export const SUPPORTED_LOCALES = ['en', 'sw']

function resolveInitialLocale() {
  if (typeof window === 'undefined') return 'en'

  const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  if (saved && SUPPORTED_LOCALES.includes(saved)) return saved
  return 'en'
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: resolveInitialLocale(),
  fallbackLocale: 'en',
  messages: { en, sw },
})

export default i18n
