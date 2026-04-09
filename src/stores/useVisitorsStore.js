import { visitorsAPI } from '@/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usePagination } from '@/stores/_shared/usePagination'

function createDefaultSummary() {
  return {
    since: null,
    totalVisitors: 0,
    totalPageViews: 0,
    onlineVisitors: 0,
    todayVisitors: 0,
    yesterdayVisitors: 0,
    thisWeekVisitors: 0,
    thisMonthVisitors: 0,
    generatedAt: null,
  }
}

function createDefaultHotspots() {
  return {
    windowDays: 30,
    generatedAt: null,
    topPages: [],
    topReferrers: [],
    topLocales: [],
    recentActivity: [],
  }
}

export const useVisitorsStore = defineStore('visitors', () => {
  const visitors = ref([])
  const visitor = ref(null)
  const summary = ref(createDefaultSummary())
  const hotspots = ref(createDefaultHotspots())
  const { pagination, setPagination } = usePagination()
  const loading = ref(false)
  const error = ref(null)

  async function listVisitors(query = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await visitorsAPI.listVisitors(query)
      if (res?.error) throw new Error(res.error)
      visitors.value = res?.visitors || []
      setPagination(res)
      return visitors.value
    } catch (err) {
      error.value = err?.message || String(err)
      return []
    } finally {
      loading.value = false
    }
  }

  async function findVisitor(visitorId) {
    loading.value = true
    error.value = null
    try {
      const res = await visitorsAPI.findVisitor(visitorId)
      if (res?.error) throw new Error(res.error)
      visitor.value = res?.visitor || null
      return visitor.value
    } catch (err) {
      error.value = err?.message || String(err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchById(visitorId) {
    return findVisitor(visitorId)
  }

  async function fetchSummary(query = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await visitorsAPI.fetchSummary(query)
      if (res?.error) throw new Error(res.error)
      summary.value = { ...createDefaultSummary(), ...(res?.summary || {}) }
      return summary.value
    } catch (err) {
      error.value = err?.message || String(err)
      return summary.value
    } finally {
      loading.value = false
    }
  }

  async function fetchHotspots(query = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await visitorsAPI.fetchHotspots(query)
      if (res?.error) throw new Error(res.error)
      hotspots.value = { ...createDefaultHotspots(), ...(res?.hotspots || {}) }
      return hotspots.value
    } catch (err) {
      error.value = err?.message || String(err)
      return hotspots.value
    } finally {
      loading.value = false
    }
  }

  return {
    visitors,
    visitor,
    summary,
    hotspots,
    pagination,
    loading,
    error,
    listVisitors,
    findVisitor,
    fetchById,
    fetchSummary,
    fetchHotspots,
  }
})
