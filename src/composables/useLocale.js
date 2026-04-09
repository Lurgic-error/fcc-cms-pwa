import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from '@/i18n'

const LOCALE_OPTIONS = Object.freeze([
  { code: 'en', label: 'English' },
  { code: 'sw', label: 'Kiswahili' },
])

export function useLocale() {
  const { locale } = useI18n({ useScope: 'global' })

  const locales = computed(() => LOCALE_OPTIONS)
  const currentLocale = computed(() => locale.value)

  function setLocale(nextLocale) {
    if (!SUPPORTED_LOCALES.includes(nextLocale)) return

    locale.value = nextLocale

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
    }
  }

  /**
   * Translates a localized object based on the current locale.
   * @param {Object|String} value - The object to translate (e.g., { en: '...', sw: '...' }) or a string.
   * @returns {String} The translated string or a fallback.
   */
  function translate(value) {
    if (!value) return ''
    if (typeof value === 'string') return value

    if (typeof value === 'object') {
      return value[currentLocale.value] || value.en || value.sw || Object.values(value)[0] || ''
    }

    return String(value)
  }

  return {
    locale: currentLocale,
    locales,
    setLocale,
    translate,
  }
}
