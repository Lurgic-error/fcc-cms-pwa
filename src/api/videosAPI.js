function parseError(error) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    'Request failed.'
  )
}

export default function ({ request }) {
  const url = '/videos'

  return Object.freeze({
    listVideos,
    listPublishedVideos,
    findVideo,
    createVideo,
    updateVideo,
    deleteVideo,
    publishVideo,
    unpublishVideo,
    archiveVideo,
    unarchiveVideo,
  })

  async function listVideos(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function listPublishedVideos(query = {}) {
    try {
      const { data } = await request.get(`${url}/published`, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function findVideo({ videoId }) {
    try {
      const { data } = await request.get(`${url}/${videoId}`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function createVideo(payload = {}) {
    const body = payload.videoInfo || payload
    try {
      const { data } = await request.post(`${url}/add-video`, body)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function updateVideo({ videoId, ...payload }) {
    const body = payload.videoInfo || payload
    try {
      const { data } = await request.post(`${url}/${videoId}/change-video`, body)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function deleteVideo({ videoId }) {
    try {
      const { data } = await request.delete(`${url}/${videoId}/delete-video`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function publishVideo({ videoId, ...payload }) {
    try {
      const { data } = await request.put(`${url}/${videoId}/publish-video`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function unpublishVideo({ videoId, ...payload }) {
    try {
      const { data } = await request.put(`${url}/${videoId}/unpublish-video`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function archiveVideo({ videoId, ...payload }) {
    try {
      const { data } = await request.put(`${url}/${videoId}/archive-video`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function unarchiveVideo({ videoId, ...payload }) {
    try {
      const { data } = await request.put(`${url}/${videoId}/unarchive-video`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }
}
