import { assetsAPI } from '@/api'
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

export const useAssetsStore = defineStore('assets', () => {
  const assets = ref([])
  const asset = ref(null)
  const loading = ref(false)
  const error = ref('')

  async function list(query = {}) {
    loading.value = true
    error.value = ''

    try {
      const response = await assetsAPI.listAssets(query)
      if (response?.error) throw response

      assets.value = response?.images || response?.items || []
      return assets.value
    } catch (err) {
      error.value = parseError(err)
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchById(assetId) {
    if (!assetId) return null

    loading.value = true
    error.value = ''

    try {
      const response = await assetsAPI.findAsset({ assetId })
      if (response?.error) throw response

      asset.value = response?.image || response || null
      return asset.value
    } catch (err) {
      error.value = parseError(err)
      asset.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    assets,
    asset,
    loading,
    error,
    list,
    fetchById,
  }
})
