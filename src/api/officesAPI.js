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
  const url = '/offices'
  const workflow = buildEditorialEntityApi({ request, baseUrl: url, parseError })

  return Object.freeze({
    listOffices,
    listPublished: listPublishedOffices,
    listPublishedOffices,
    listArchivedOffices: workflow.listArchived,
    findOffice,
    createOffice,
    updateOffice,
    deleteOffice,
    ...workflow,
  })

  async function listOffices(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function listPublishedOffices(query = {}) {
    try {
      const { data } = await request.get(`${url}/published`, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function findOffice({ officeId }) {
    try {
      const { data } = await request.get(`${url}/${officeId}`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function createOffice(payload = {}) {
    const body = payload.officeInfo || payload
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

  async function updateOffice({ officeId, ...payload }) {
    const body = payload.officeInfo || payload
    try {
      const requestBody = hasBinaryValue(body) ? buildMultipartPayload(body) : body
      const { data } = await request.put(`${url}/${officeId}/update`, requestBody, {
        headers: hasBinaryValue(body) ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function deleteOffice({ officeId }) {
    try {
      const { data } = await request.delete(`${url}/${officeId}/delete`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }
}
