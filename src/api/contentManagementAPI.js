import { unwrapApiResponsePayload, wrapApiErrorResult } from './responseEnvelope'
import { buildEditorialEntityApi, parseEditorialApiError } from './editorialEntityApi'

function parseError(error) {
  return parseEditorialApiError(error)
}

function buildEntityApi({ request, baseUrl }) {
  const workflow = buildEditorialEntityApi({
    request,
    baseUrl,
    parseError,
  })

  return Object.freeze({
    list,
    find,
    create,
    update,
    remove,
    listPublished,
    ...workflow,
  })

  async function list(query = {}) {
    try {
      const { data } = await request.get(baseUrl, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function find(id) {
    try {
      const { data } = await request.get(`${baseUrl}/${id}`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function create(payload = {}) {
    try {
      const { data } = await request.post(`${baseUrl}/create`, payload)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function update(id, payload = {}) {
    try {
      const { data } = await request.put(`${baseUrl}/${id}/update`, payload)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function remove(id) {
    try {
      const { data } = await request.delete(`${baseUrl}/${id}/delete`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }
  async function listPublished(query = {}) {
    try {
      const { data } = await request.get(`${baseUrl}/published`, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }
}

export default function ({ request }) {
  const root = '/content-management'

  const blockTypes = buildEntityApi({ request, baseUrl: `${root}/block-types` })
  const layouts = buildEntityApi({ request, baseUrl: `${root}/layouts` })
  const pages = buildEntityApi({ request, baseUrl: `${root}/pages` })
  const contentItems = buildEntityApi({ request, baseUrl: `${root}/content-items` })
  const contentVersions = buildEntityApi({ request, baseUrl: `${root}/content-versions` })
  const placements = buildEntityApi({ request, baseUrl: `${root}/placements` })

  async function createContentVersionForItem(contentItemId, payload = {}) {
    try {
      const { data } = await request.post(
        `${root}/content-items/${contentItemId}/versions`,
        payload,
      )
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function reorderPlacements({ pageId, regionKey, placementIds }) {
    try {
      const { data } = await request.put(`${root}/placements/reorder`, {
        pageId,
        regionKey,
        placementIds,
      })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  return Object.freeze({
    blockTypes,
    layouts,
    pages,
    contentItems,
    contentVersions,
    placements: Object.freeze({
      ...placements,
      reorder: reorderPlacements,
    }),
    createContentVersionForItem,
  })
}
