import {
  buildEditorialEntityApi,
  buildMultipartPayload,
  hasBinaryValue,
  parseEditorialApiError,
} from './editorialEntityApi'

function parseError(error) {
  return parseEditorialApiError(error)
}

export default function ({ request }) {
  const url = '/directorates'
  const workflow = buildEditorialEntityApi({ request, baseUrl: url, parseError })

  return Object.freeze({
    listDirectorates,
    listPublished: listPublishedDirectorates,
    listPublishedDirectorates,
    listArchivedDirectorates: workflow.listArchived,
    findDirectorate,
    createDirectorate,
    updateDirectorate,
    deleteDirectorate,
    ...workflow,
  })

  async function listDirectorates(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function listPublishedDirectorates(query = {}) {
    try {
      const { data } = await request.get(`${url}/published`, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function findDirectorate({ directorateId }) {
    try {
      const { data } = await request.get(`${url}/${directorateId}`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function createDirectorate(payload = {}) {
    const body = payload.directorateInfo || payload
    try {
      const requestBody = hasBinaryValue(body) ? buildMultipartPayload(body) : body
      const { data } = await request.post(`${url}/create`, requestBody, {
        headers: hasBinaryValue(body) ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function updateDirectorate({ directorateId, ...payload }) {
    const body = payload.directorateInfo || payload
    try {
      const requestBody = hasBinaryValue(body) ? buildMultipartPayload(body) : body
      const { data } = await request.put(`${url}/${directorateId}/update`, requestBody, {
        headers: hasBinaryValue(body) ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function deleteDirectorate({ directorateId }) {
    try {
      const { data } = await request.delete(`${url}/${directorateId}/delete`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }
}
