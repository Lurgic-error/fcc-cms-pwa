import { buildMultipartPayload, hasBinaryValue } from './editorialEntityApi'

function parseError(error) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    'Request failed.'
  )
}

function toPhotoId(payload = {}) {
  return payload?.photoId || payload?.imageId || payload?.id || ''
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
    listPhotos,
    listPublishedPhotos,
    findPhoto,
    createPhoto,
    updatePhoto,
    deletePhoto,
    publishPhoto,
    unpublishPhoto,
    archivePhoto,
    unarchivePhoto,
  })

  async function listPhotos(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function listPublishedPhotos(query = {}) {
    try {
      const { data } = await request.get(`${url}/published`, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function findPhoto(payload = {}) {
    const photoId = toPhotoId(payload)
    if (!photoId) return { error: 'Photo ID is required.' }

    try {
      const { data } = await request.get(`${url}/${photoId}`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function createPhoto(payload = {}) {
    const body = payload?.photoInfo || payload?.imageInfo || payload

    try {
      const { data } = await request.post(`${url}/add-image`, toFormData(body), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function updatePhoto(payload = {}) {
    const photoId = toPhotoId(payload)
    if (!photoId) return { error: 'Photo ID is required.' }

    const body = payload?.photoInfo || payload?.imageInfo || payload
    const requestBody = hasBinaryValue(body) ? buildMultipartPayload(body) : toFormData(body)

    try {
      const { data } = await request.post(`${url}/${photoId}/change-image`, requestBody, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function deletePhoto(payload = {}) {
    const photoId = toPhotoId(payload)
    if (!photoId) return { error: 'Photo ID is required.' }

    try {
      const { data } = await request.delete(`${url}/${photoId}/delete-image`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function publishPhoto(payload = {}) {
    const photoId = toPhotoId(payload)
    if (!photoId) return { error: 'Photo ID is required.' }

    try {
      const { data } = await request.put(`${url}/${photoId}/publish-image`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function unpublishPhoto(payload = {}) {
    const photoId = toPhotoId(payload)
    if (!photoId) return { error: 'Photo ID is required.' }

    try {
      const { data } = await request.put(`${url}/${photoId}/unpublish-image`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function archivePhoto(payload = {}) {
    const photoId = toPhotoId(payload)
    if (!photoId) return { error: 'Photo ID is required.' }

    try {
      const { data } = await request.put(`${url}/${photoId}/archive-image`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function unarchivePhoto(payload = {}) {
    const photoId = toPhotoId(payload)
    if (!photoId) return { error: 'Photo ID is required.' }

    try {
      const { data } = await request.put(`${url}/${photoId}/unarchive-image`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }
}
