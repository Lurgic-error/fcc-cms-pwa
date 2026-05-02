import { unwrapApiResponsePayload, wrapApiErrorResult } from './responseEnvelope'
import { buildEditorialEntityApi, parseEditorialApiError } from './editorialEntityApi'

function parseError(error) {
  return parseEditorialApiError(error)
}

export default function ({ request }) {
  const url = '/commission-services'
  const workflow = buildEditorialEntityApi({ request, baseUrl: url, parseError })

  return Object.freeze({
    listServices,
    listPublished: listPublishedServices,
    listPublishedServices,
    listArchivedServices: workflow.listArchived,
    findService,
    createService,
    updateService,
    deleteService,
    ...workflow,
  })

  async function listServices(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function listPublishedServices(query = {}) {
    try {
      const { data } = await request.get(`${url}/published`, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function findService({ serviceId }) {
    try {
      const { data } = await request.get(`${url}/${serviceId}`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function createService(payload = {}) {
    const body = payload.serviceInfo || payload
    try {
      const { data } = await request.post(`${url}/create`, body)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function updateService({ serviceId, ...payload }) {
    const body = payload.serviceInfo || payload
    try {
      const { data } = await request.put(`${url}/${serviceId}/update`, body)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function deleteService({ serviceId }) {
    try {
      const { data } = await request.delete(`${url}/${serviceId}/delete`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }
}
