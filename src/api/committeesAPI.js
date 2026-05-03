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
  const url = '/committees'

  return Object.freeze({
    listCommittees,
    listPublishedCommittees,
    findCommittee,
    createCommittee,
    updateCommittee,
    deleteCommittee,
  })

  async function listCommittees(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function listPublishedCommittees(query = {}) {
    try {
      const { data } = await request.get(`${url}/published`, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function findCommittee({ committeeId }) {
    try {
      const { data } = await request.get(`${url}/${committeeId}`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function createCommittee(payload = {}) {
    const body = payload.committeeInfo || payload
    try {
      const { data } = await request.post(`${url}/register-committee`, body)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function updateCommittee({ committeeId, ...payload }) {
    const body = payload.committeeInfo || payload
    try {
      const { data } = await request.put(`${url}/${committeeId}/update-committee`, body)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function deleteCommittee({ committeeId }) {
    try {
      const { data } = await request.delete(`${url}/${committeeId}/delete-committee`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }
}
