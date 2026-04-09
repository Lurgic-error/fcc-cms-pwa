import { photosAPI } from '@/api'
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

export const usePhotosStore = defineStore('photos', () => {
  const photos = ref([])
  const photo = ref(null)
  const loading = ref(false)
  const error = ref('')

  async function list(query = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await photosAPI.listPhotos(query)
      if (response?.error) throw response

      photos.value = response?.images || response?.items || []
      return photos.value
    } catch (err) {
      error.value = parseError(err)
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchById(photoId) {
    if (!photoId) return null

    loading.value = true
    error.value = ''

    try {
      const response = await photosAPI.findPhoto({ photoId })
      if (response?.error) throw response

      photo.value = response?.image || response || null
      return photo.value
    } catch (err) {
      error.value = parseError(err)
      photo.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    photos,
    photo,
    loading,
    error,
    list,
    fetchById,
  }
})
