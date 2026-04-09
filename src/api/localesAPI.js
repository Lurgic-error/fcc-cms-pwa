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
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function find(localeId) {
    try {
      const { data } = await request.get(`${baseUrl}/${localeId}`)
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

  async function update(localeId, payload = {}) {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/update`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function remove(localeId) {
    try {
      const { data } = await request.delete(`${baseUrl}/${localeId}/delete`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function softDelete(localeId, reason = '') {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/soft-delete`, { reason })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function restore(localeId) {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/restore`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function submit(localeId) {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/submit`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function approve(localeId) {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/approve`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function reject(localeId, reason = '') {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/reject`, { reason })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function publish(localeId) {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/publish`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function unpublish(localeId) {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/unpublish`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function archive(localeId, reason = '') {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/archive`, { reason })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function restoreArchived(localeId) {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/restore-archive`)
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

  async function listArchived(query = {}) {
    try {
      const { data } = await request.get(`${baseUrl}/archived`, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function listActive() {
    try {
      const { data } = await request.get(`${baseUrl}/active`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function resolveFallbackChain(locale) {
    try {
      const localePart = locale ? `/${locale}` : ''
      const { data } = await request.get(`${baseUrl}/fallback-chain${localePart}`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function setDefault(localeId) {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/set-default`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function setActive(localeId, isActive) {
    try {
      const { data } = await request.put(`${baseUrl}/${localeId}/active`, { isActive })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }
}
