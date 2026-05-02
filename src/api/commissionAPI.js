import { unwrapApiResponsePayload, wrapApiErrorResult } from './responseEnvelope'
import { appendFormValue, hasBinaryValue, parseEditorialApiError } from './editorialEntityApi'

function parseError(error) {
  return parseEditorialApiError(error)
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function stripBinaryValues(value) {
  if (value instanceof File) return null

  if (Array.isArray(value)) {
    return value.map((item) => stripBinaryValues(item))
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, stripBinaryValues(item)]),
    )
  }

  return value
}

function appendStructuredBodyValue(formData, key, value) {
  if (value === undefined) return

  if (Array.isArray(value) || isPlainObject(value)) {
    formData.append(key, JSON.stringify(value))
    return
  }

  appendFormValue(formData, key, value)
}

function appendBinaryEntries(formData, value, path = '') {
  if (!path) return

  if (value instanceof File) {
    formData.append(path, value)
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      appendBinaryEntries(formData, item, `${path}[${index}]`)
    })
    return
  }

  if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, item]) => {
      appendBinaryEntries(formData, item, path ? `${path}.${key}` : key)
    })
  }
}

function buildCommissionMultipartPayload(payload = {}) {
  const formData = new FormData()
  const sanitized = stripBinaryValues(payload) || {}

  Object.entries(sanitized).forEach(([key, value]) => {
    appendStructuredBodyValue(formData, key, value)
  })

  Object.entries(payload || {}).forEach(([key, value]) => {
    appendBinaryEntries(formData, value, key)
  })

  return formData
}

export default function ({ request }) {
  const url = '/commission'

  return Object.freeze({
    fetchCommission,
    fetchCommissionHistory,
    fetchCommissionManagement,
    updateCommission,
    updateCommissionOverview,
    updateCommissionHistory,
    submit,
    approve,
    reject,
    publish,
    unpublish,
    schedulePublish,
    scheduleUnpublish,
    cancelPublishSchedule,
    cancelUnpublishSchedule,
    archive,
    restoreArchived,
    softDelete,
    restore,
    remove,
  })

  async function fetchCommission() {
    try {
      const { data } = await request.get(url)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function fetchCommissionHistory() {
    try {
      const { data } = await request.get(`${url}/history`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function fetchCommissionManagement() {
    try {
      const { data } = await request.get(`${url}/management`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function updateCommission(payload = {}) {
    try {
      const requestBody = hasBinaryValue(payload)
        ? buildCommissionMultipartPayload(payload)
        : payload
      const { data } = await request.put(url, requestBody, {
        headers: hasBinaryValue(payload) ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function updateCommissionOverview(payload = {}) {
    return await updateCommission(payload)
  }

  async function updateCommissionHistory(payload = {}) {
    const history = payload?.history ?? payload

    return await updateCommission({ history })
  }

  async function submit(commissionId) {
    try {
      const { data } = await request.put(`${url}/${commissionId}/submit`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function approve(commissionId) {
    try {
      const { data } = await request.put(`${url}/${commissionId}/approve`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function reject(commissionId, reason = '') {
    try {
      const { data } = await request.put(`${url}/${commissionId}/reject`, { reason })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function publish(commissionId) {
    try {
      const { data } = await request.put(`${url}/${commissionId}/publish`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function unpublish(commissionId) {
    try {
      const { data } = await request.put(`${url}/${commissionId}/unpublish`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function schedulePublish(commissionId, payload = {}) {
    try {
      const { data } = await request.put(`${url}/${commissionId}/schedule-publish`, payload)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function scheduleUnpublish(commissionId, payload = {}) {
    try {
      const { data } = await request.put(`${url}/${commissionId}/schedule-unpublish`, payload)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function cancelPublishSchedule(commissionId) {
    try {
      const { data } = await request.put(`${url}/${commissionId}/cancel-publish-schedule`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function cancelUnpublishSchedule(commissionId) {
    try {
      const { data } = await request.put(`${url}/${commissionId}/cancel-unpublish-schedule`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function archive(commissionId, reason = '') {
    try {
      const { data } = await request.put(`${url}/${commissionId}/archive`, { reason })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function restoreArchived(commissionId) {
    try {
      const { data } = await request.put(`${url}/${commissionId}/restore-archive`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function softDelete(commissionId, reason = '') {
    try {
      const { data } = await request.put(`${url}/${commissionId}/soft-delete`, { reason })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function restore(commissionId) {
    try {
      const { data } = await request.put(`${url}/${commissionId}/restore`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function remove(commissionId) {
    try {
      const { data } = await request.delete(`${url}/${commissionId}/delete`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }
}
