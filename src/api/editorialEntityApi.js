export function parseEditorialApiError(error) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    'Request failed.'
  )
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export function appendFormValue(formData, key, value) {
  if (value === undefined) return
  if (value === null) {
    formData.append(key, '')
    return
  }

  if (value instanceof File) {
    formData.append(key, value)
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (item === undefined || item === null || item === '') return
      appendFormValue(formData, key, item)
    })
    return
  }

  if (isPlainObject(value)) {
    formData.append(key, JSON.stringify(value))
    return
  }

  formData.append(key, value)
}

export function hasBinaryValue(value) {
  if (value instanceof File) return true
  if (Array.isArray(value)) return value.some((item) => hasBinaryValue(item))
  if (isPlainObject(value)) return Object.values(value).some((item) => hasBinaryValue(item))
  return false
}

function stripBinaryValues(value) {
  if (value instanceof File) return undefined

  if (Array.isArray(value)) {
    const nextItems = value
      .map((item) => stripBinaryValues(item))
      .filter((item) => item !== undefined)

    return nextItems.length ? nextItems : undefined
  }

  if (isPlainObject(value)) {
    const nextEntries = Object.entries(value)
      .map(([key, item]) => [key, stripBinaryValues(item)])
      .filter(([, item]) => item !== undefined)

    return nextEntries.length ? Object.fromEntries(nextEntries) : undefined
  }

  return value
}

function collectBinaryEntries(value, fallbackKey, entries = []) {
  if (value instanceof File) {
    entries.push({ key: fallbackKey, file: value })
    return entries
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectBinaryEntries(item, fallbackKey, entries))
    return entries
  }

  if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, item]) => {
      collectBinaryEntries(item, key, entries)
    })
  }

  return entries
}

export function buildMultipartPayload(payload = {}) {
  const formData = new FormData()
  const sanitized = stripBinaryValues(payload) || {}

  Object.entries(sanitized).forEach(([key, value]) => {
    appendFormValue(formData, key, value)
  })

  Object.entries(payload || {}).forEach(([key, value]) => {
    collectBinaryEntries(value, key).forEach(({ key: fieldKey, file }) => {
      formData.append(fieldKey, file)
    })
  })

  return formData
}

export function buildEditorialEntityApi({ request, baseUrl, parseError = parseEditorialApiError }) {
  async function listArchived(query = {}) {
    try {
      const { data } = await request.get(`${baseUrl}/archived`, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function softDelete(id, reason = '') {
    try {
      const { data } = await request.put(`${baseUrl}/${id}/soft-delete`, { reason })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function bulkSoftDelete({ ids = [], reason = '' } = {}) {
    try {
      const { data } = await request.put(`${baseUrl}/bulk/soft-delete`, { ids, reason })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function restore(id) {
    try {
      const { data } = await request.put(`${baseUrl}/${id}/restore`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function bulkRestore({ ids = [] } = {}) {
    try {
      const { data } = await request.put(`${baseUrl}/bulk/restore`, { ids })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function submit(id) {
    try {
      const { data } = await request.put(`${baseUrl}/${id}/submit`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function approve(id) {
    try {
      const { data } = await request.put(`${baseUrl}/${id}/approve`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function reject(id, reason = '') {
    try {
      const { data } = await request.put(`${baseUrl}/${id}/reject`, { reason })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function publish(id) {
    try {
      const { data } = await request.put(`${baseUrl}/${id}/publish`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function bulkPublish({ ids = [] } = {}) {
    try {
      const { data } = await request.put(`${baseUrl}/bulk/publish`, { ids })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function unpublish(id) {
    try {
      const { data } = await request.put(`${baseUrl}/${id}/unpublish`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function bulkUnpublish({ ids = [] } = {}) {
    try {
      const { data } = await request.put(`${baseUrl}/bulk/unpublish`, { ids })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function schedulePublish(id, payload = {}) {
    try {
      const { data } = await request.put(`${baseUrl}/${id}/schedule-publish`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function scheduleUnpublish(id, payload = {}) {
    try {
      const { data } = await request.put(`${baseUrl}/${id}/schedule-unpublish`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function bulkSchedulePublish({ items = [] } = {}) {
    try {
      const { data } = await request.put(`${baseUrl}/bulk/schedule-publish`, { items })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function bulkScheduleUnpublish({ items = [] } = {}) {
    try {
      const { data } = await request.put(`${baseUrl}/bulk/schedule-unpublish`, { items })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function cancelPublishSchedule(id) {
    try {
      const { data } = await request.put(`${baseUrl}/${id}/cancel-publish-schedule`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function cancelUnpublishSchedule(id) {
    try {
      const { data } = await request.put(`${baseUrl}/${id}/cancel-unpublish-schedule`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function bulkCancelPublishSchedule({ ids = [] } = {}) {
    try {
      const { data } = await request.put(`${baseUrl}/bulk/cancel-publish-schedule`, { ids })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function bulkCancelUnpublishSchedule({ ids = [] } = {}) {
    try {
      const { data } = await request.put(`${baseUrl}/bulk/cancel-unpublish-schedule`, { ids })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function archive(id, reason = '') {
    try {
      const { data } = await request.put(`${baseUrl}/${id}/archive`, { reason })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function bulkArchive({ ids = [], reason = '' } = {}) {
    try {
      const { data } = await request.put(`${baseUrl}/bulk/archive`, { ids, reason })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function restoreArchived(id) {
    try {
      const { data } = await request.put(`${baseUrl}/${id}/restore-archive`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function bulkRestoreArchived({ ids = [] } = {}) {
    try {
      const { data } = await request.put(`${baseUrl}/bulk/restore-archive`, { ids })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function bulkRemove({ ids = [] } = {}) {
    try {
      const { data } = await request.delete(`${baseUrl}/bulk/delete`, { data: { ids } })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  return Object.freeze({
    listArchived,
    softDelete,
    bulkSoftDelete,
    restore,
    bulkRestore,
    submit,
    approve,
    reject,
    publish,
    bulkPublish,
    unpublish,
    bulkUnpublish,
    schedulePublish,
    scheduleUnpublish,
    bulkSchedulePublish,
    bulkScheduleUnpublish,
    cancelPublishSchedule,
    cancelUnpublishSchedule,
    bulkCancelPublishSchedule,
    bulkCancelUnpublishSchedule,
    archive,
    bulkArchive,
    restoreArchived,
    bulkRestoreArchived,
    bulkRemove,
  })
}
