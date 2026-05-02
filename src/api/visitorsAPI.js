import { unwrapApiResponsePayload, wrapApiErrorResult } from './responseEnvelope'
function parseError(error) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    'Request failed'
  )
}

export default function ({ request }) {
  const url = '/visitors'

  return Object.freeze({
    listVisitors,
    findVisitor,
    fetchSummary,
    fetchHotspots,
  })

  async function listVisitors(query = {}) {
    try {
      const { data } = await request.get(`${url}`, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function findVisitor(visitorId) {
    try {
      const { data } = await request.get(`${url}/${visitorId}`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function fetchSummary(query = {}) {
    try {
      const { data } = await request.get(`${url}/summary`, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function fetchHotspots(query = {}) {
    try {
      const { data } = await request.get(`${url}/hotspots`, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }
}
