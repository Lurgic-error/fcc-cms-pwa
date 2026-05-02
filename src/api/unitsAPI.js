import { unwrapApiResponsePayload, wrapApiErrorResult } from './responseEnvelope'
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
  const url = '/units'
  const workflow = buildEditorialEntityApi({ request, baseUrl: url, parseError })

  return Object.freeze({
    listUnits,
    listPublished: listPublishedUnits,
    listPublishedUnits,
    listArchivedUnits: workflow.listArchived,
    findUnit,
    createUnit,
    updateUnit,
    deleteUnit,
    ...workflow,
  })

  async function listUnits(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function listPublishedUnits(query = {}) {
    try {
      const { data } = await request.get(`${url}/published`, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function findUnit({ unitId }) {
    try {
      const { data } = await request.get(`${url}/${unitId}`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function createUnit(payload = {}) {
    const body = payload.unitInfo || payload
    try {
      const requestBody = hasBinaryValue(body) ? buildMultipartPayload(body) : body
      const { data } = await request.post(`${url}/create`, requestBody, {
        headers: hasBinaryValue(body) ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function updateUnit({ unitId, ...payload }) {
    const body = payload.unitInfo || payload
    try {
      const requestBody = hasBinaryValue(body) ? buildMultipartPayload(body) : body
      const { data } = await request.put(`${url}/${unitId}/update`, requestBody, {
        headers: hasBinaryValue(body) ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function deleteUnit({ unitId }) {
    try {
      const { data } = await request.delete(`${url}/${unitId}/delete`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }
}
