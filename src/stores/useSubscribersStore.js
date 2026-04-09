import { subscribersAPI } from '@/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'

function parseError(error) {
  return (
    error?.error ||
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    'Request failed.'
  )
}

export const useSubscribersStore = defineStore('subscribers', () => {
  const subscribers = ref([])
  const subscriber = ref(null)
  const loading = ref(false)
  const error = ref('')

  async function list(query = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await subscribersAPI.listSubscribers(query)
      if (response?.error) throw response

      subscribers.value = response?.subscribers || response?.items || []
      return subscribers.value
    } catch (err) {
      error.value = parseError(err)
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchById(subscriberId) {
    if (!subscriberId) return null

    loading.value = true
    error.value = ''

    try {
      const response = await subscribersAPI.findSubscriber({ subscriberId })
      if (response?.error) throw response

      subscriber.value = response?.subscriber || response || null
      return subscriber.value
    } catch (err) {
      error.value = parseError(err)
      subscriber.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    subscribers,
    subscriber,
    loading,
    error,
    list,
    fetchById,
  }
})
