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
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function find(id) {
    try {
      const { data } = await request.get(`${baseUrl}/${id}`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function create(payload = {}) {
    try {
      const { data } = await request.post(`${baseUrl}/create`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function update(id, payload = {}) {
    try {
      const { data } = await request.put(`${baseUrl}/${id}/update`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function remove(id) {
    try {
      const { data } = await request.delete(`${baseUrl}/${id}/delete`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }
  async function listPublished(query = {}) {
    try {
      const { data } = await request.get(`${baseUrl}/published`, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
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
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function reorderPlacements({ pageId, regionKey, placementIds }) {
    try {
      const { data } = await request.put(`${root}/placements/reorder`, {
        pageId,
        regionKey,
        placementIds,
      })
      return data
    } catch (error) {
      return { error: parseError(error) }
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
