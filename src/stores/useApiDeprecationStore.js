import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useApiDeprecationStore = defineStore('apiDeprecation', () => {
  const notice = ref(null)
  const visible = computed(() => Boolean(notice.value))

  function setNotice(nextNotice = {}) {
    notice.value = {
      sunset: nextNotice.sunset || '',
      deprecation: nextNotice.deprecation || '',
      url: nextNotice.url || '',
    }
  }

  function clearNotice() {
    notice.value = null
  }

  return {
    clearNotice,
    notice,
    setNotice,
    visible,
  }
})
