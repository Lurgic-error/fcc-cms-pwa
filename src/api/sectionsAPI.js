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
  const url = '/sections'
  const workflow = buildEditorialEntityApi({ request, baseUrl: url, parseError })

  return Object.freeze({
    listSections,
    listPublished: listPublishedSections,
    listPublishedSections,
    listArchivedSections: workflow.listArchived,
    findSection,
    createSection,
    updateSection,
    deleteSection,
    ...workflow,
  })

  async function listSections(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function listPublishedSections(query = {}) {
    try {
      const { data } = await request.get(`${url}/published`, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function findSection({ sectionId }) {
    try {
      const { data } = await request.get(`${url}/${sectionId}`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function createSection(payload = {}) {
    const body = payload.sectionInfo || payload
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

  async function updateSection({ sectionId, ...payload }) {
    const body = payload.sectionInfo || payload
    try {
      const requestBody = hasBinaryValue(body) ? buildMultipartPayload(body) : body
      const { data } = await request.put(`${url}/${sectionId}/update`, requestBody, {
        headers: hasBinaryValue(body) ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function deleteSection({ sectionId }) {
    try {
      const { data } = await request.delete(`${url}/${sectionId}/delete`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }
}
