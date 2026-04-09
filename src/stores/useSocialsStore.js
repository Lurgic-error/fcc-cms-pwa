import { socialsAPI } from '@/api'
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

export const useSocialsStore = defineStore('socials', () => {
  const socials = ref([])
  const social = ref(null)
  const loading = ref(false)
  const error = ref('')

  async function list(query = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await socialsAPI.listSocials(query)
      if (response?.error) throw response

      socials.value = response?.socials || response?.items || []
      return socials.value
    } catch (err) {
      error.value = parseError(err)
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchById(socialId) {
    if (!socialId) return null

    loading.value = true
    error.value = ''

    try {
      const response = await socialsAPI.findSocial({ socialId })
      if (response?.error) throw response

      social.value = response?.social || response || null
      return social.value
    } catch (err) {
      error.value = parseError(err)
      social.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    socials,
    social,
    loading,
    error,
    list,
    fetchById,
  }
})
