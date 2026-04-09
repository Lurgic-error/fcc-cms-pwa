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
  const url = '/commissioners'
  const workflow = buildEditorialEntityApi({ request, baseUrl: url, parseError })

  return Object.freeze({
    listCommissioners,
    listPublished: listPublishedCommissioners,
    listPublishedCommissioners,
    listArchivedCommissioners: workflow.listArchived,
    findCommissioner,
    createCommissioner,
    updateCommissioner,
    deleteCommissioner,
    ...workflow,
  })

  async function listCommissioners(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function listPublishedCommissioners(query = {}) {
    try {
      const { data } = await request.get(`${url}/published`, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function findCommissioner({ commissionerId }) {
    try {
      const { data } = await request.get(`${url}/${commissionerId}`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function createCommissioner(payload = {}) {
    const body = payload.commissionerInfo || payload
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

  async function updateCommissioner({ commissionerId, ...payload }) {
    const body = payload.commissionerInfo || payload
    try {
      const requestBody = hasBinaryValue(body) ? buildMultipartPayload(body) : body
      const { data } = await request.put(`${url}/${commissionerId}/update`, requestBody, {
        headers: hasBinaryValue(body) ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function deleteCommissioner({ commissionerId }) {
    try {
      const { data } = await request.delete(`${url}/${commissionerId}/delete`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }
}
