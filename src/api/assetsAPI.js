function parseError(error) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    'Request failed.'
  )
}

function toAssetId(payload = {}) {
  return payload?.assetId || payload?.imageId || payload?.id || ''
}

export default function ({ request }) {
  const url = '/images'

  function toFormData(payload = {}) {
    const formData = new FormData()

    Object.entries(payload || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return

      if ((key === 'images[]' || key === 'images') && Array.isArray(value)) {
        value.forEach((file) => {
          if (file instanceof File) {
            formData.append('images[]', file)
          }
        })
        return
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== undefined && item !== null && item !== '') {
            formData.append(key, item)
          }
        })
        return
      }

      formData.append(key, value)
    })

    return formData
  }

  return Object.freeze({
    listAssets,
    listPublishedAssets,
    findAsset,
    createAsset,
    updateAsset,
    deleteAsset,
    publishAsset,
    unpublishAsset,
    archiveAsset,
    unarchiveAsset,
  })

  async function listAssets(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function listPublishedAssets(query = {}) {
    try {
      const { data } = await request.get(`${url}/published`, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function findAsset(payload = {}) {
    const assetId = toAssetId(payload)
    if (!assetId) return { error: 'Asset ID is required.' }

    try {
      const { data } = await request.get(`${url}/${assetId}`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function createAsset(payload = {}) {
    const body = payload?.assetInfo || payload?.imageInfo || payload

    try {
      const { data } = await request.post(`${url}/add-image`, toFormData(body), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function updateAsset(payload = {}) {
    const assetId = toAssetId(payload)
    if (!assetId) return { error: 'Asset ID is required.' }

    const body = payload?.assetInfo || payload?.imageInfo || payload

    try {
      const { data } = await request.post(`${url}/${assetId}/change-image`, body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function deleteAsset(payload = {}) {
    const assetId = toAssetId(payload)
    if (!assetId) return { error: 'Asset ID is required.' }

    try {
      const { data } = await request.delete(`${url}/${assetId}/delete-image`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function publishAsset(payload = {}) {
    const assetId = toAssetId(payload)
    if (!assetId) return { error: 'Asset ID is required.' }

    try {
      const { data } = await request.put(`${url}/${assetId}/publish-image`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function unpublishAsset(payload = {}) {
    const assetId = toAssetId(payload)
    if (!assetId) return { error: 'Asset ID is required.' }

    try {
      const { data } = await request.put(`${url}/${assetId}/unpublish-image`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function archiveAsset(payload = {}) {
    const assetId = toAssetId(payload)
    if (!assetId) return { error: 'Asset ID is required.' }

    try {
      const { data } = await request.put(`${url}/${assetId}/archive-image`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function unarchiveAsset(payload = {}) {
    const assetId = toAssetId(payload)
    if (!assetId) return { error: 'Asset ID is required.' }

    try {
      const { data } = await request.put(`${url}/${assetId}/unarchive-image`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }
}
