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
  const baseUrl = '/locales'

  return Object.freeze({
    list,
    find,
    create,
    update,
    remove,
    softDelete,
    restore,
    submit,
    approve,
    reject,
    publish,
    unpublish,
    archive,
    restoreArchived,
    listPublished,
    listArchived,
    listActive,
    resolveFallbackChain,
    setDefault,
    setActive,
  })

  async function list(query = {}) {
    try {
      const { data } = await request.get(baseUrl, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function find(localeId) {
    try {
      const { data } = await request.get(`${baseUrl}/${localeId}`)
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

  async function update(localeId, payload = {}) {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/update`, payload)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function remove(localeId) {
    try {
      const { data } = await request.delete(`${baseUrl}/${localeId}/delete`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function softDelete(localeId, reason = '') {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/soft-delete`, { reason })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function restore(localeId) {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/restore`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function submit(localeId) {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/submit`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function approve(localeId) {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/approve`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function reject(localeId, reason = '') {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/reject`, { reason })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function publish(localeId) {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/publish`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function unpublish(localeId) {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/unpublish`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function archive(localeId, reason = '') {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/archive`, { reason })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function restoreArchived(localeId) {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/restore-archive`)
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

  async function listArchived(query = {}) {
    try {
      const { data } = await request.get(`${baseUrl}/archived`, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function listActive() {
    try {
      const { data } = await request.get(`${baseUrl}/active`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function resolveFallbackChain(locale) {
    try {
      const localePart = locale ? `/${locale}` : ''
      const { data } = await request.get(`${baseUrl}/fallback-chain${localePart}`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function setDefault(localeId) {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/set-default`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function setActive(localeId, isActive) {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/active`, { isActive })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }
}
