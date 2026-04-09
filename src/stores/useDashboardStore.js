import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDashboardStore = defineStore('dashboard', () => {
  const announcements = ref([])

  function setAnnouncements(items = []) {
    announcements.value = Array.isArray(items) ? items : []
  }

  return {
    announcements,
    setAnnouncements,
  }
})
