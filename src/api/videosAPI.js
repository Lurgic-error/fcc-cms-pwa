import { unwrapApiResponsePayload, wrapApiErrorResult } from './responseEnvelope'
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
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function listPublishedVideos(query = {}) {
    try {
      const { data } = await request.get(`${url}/published`, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function findVideo({ videoId }) {
    try {
      const { data } = await request.get(`${url}/${videoId}`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function createVideo(payload = {}) {
    const body = payload.videoInfo || payload
    try {
      const { data } = await request.post(`${url}/add-video`, body)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function updateVideo({ videoId, ...payload }) {
    const body = payload.videoInfo || payload
    try {
      const { data } = await request.post(`${url}/${videoId}/change-video`, body)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function deleteVideo({ videoId }) {
    try {
      const { data } = await request.delete(`${url}/${videoId}/delete-video`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function publishVideo({ videoId, ...payload }) {
    try {
      const { data } = await request.put(`${url}/${videoId}/publish-video`, payload)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function unpublishVideo({ videoId, ...payload }) {
    try {
      const { data } = await request.put(`${url}/${videoId}/unpublish-video`, payload)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function archiveVideo({ videoId, ...payload }) {
    try {
      const { data } = await request.put(`${url}/${videoId}/archive-video`, payload)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function unarchiveVideo({ videoId, ...payload }) {
    try {
      const { data } = await request.put(`${url}/${videoId}/unarchive-video`, payload)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }
}
