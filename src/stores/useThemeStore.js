import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const STORAGE_KEY = 'fccThemeMode'

function getSystemPreference() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref('system')
  const systemTheme = ref(getSystemPreference())

  const resolvedTheme = computed(() => {
    if (mode.value === 'system') return systemTheme.value
    return mode.value
  })

  function applyTheme() {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    root.dataset.themeMode = mode.value
    root.dataset.theme = resolvedTheme.value
    root.classList.toggle('dark', resolvedTheme.value === 'dark')
  }

  function setMode(nextMode) {
    if (!['light', 'dark', 'system'].includes(nextMode)) return

    mode.value = nextMode

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, nextMode)
    }

    applyTheme()
  }

  function initTheme() {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        mode.value = saved
      }

      const media = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = (event) => {
        systemTheme.value = event.matches ? 'dark' : 'light'
        if (mode.value === 'system') applyTheme()
      }

      if (media.addEventListener) {
        media.addEventListener('change', listener)
      } else if (media.addListener) {
        media.addListener(listener)
      }
    }

    systemTheme.value = getSystemPreference()
    applyTheme()
  }

  return {
    mode,
    resolvedTheme,
    setMode,
    initTheme,
  }
})
