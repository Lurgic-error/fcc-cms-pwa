function parseError(error) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    'Request failed.'
  )
}

export default function ({ request }) {
  const url = '/socials'

  return Object.freeze({
    listSocials,
    listPublishedSocials,
    findSocial,
    createSocial,
    updateSocial,
    deleteSocial,
  })

  async function listSocials(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function listPublishedSocials(query = {}) {
    try {
      const { data } = await request.get(`${url}/published`, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function findSocial({ socialId }) {
    try {
      const { data } = await request.get(`${url}/${socialId}`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function createSocial(payload = {}) {
    const body = payload.socialInfo || payload
    try {
      const { data } = await request.post(`${url}/create-social`, body)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function updateSocial({ socialId, ...payload }) {
    const body = payload.socialInfo || payload
    try {
      const { data } = await request.put(`${url}/${socialId}/update-social`, body)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function deleteSocial({ socialId }) {
    try {
      const { data } = await request.delete(`${url}/${socialId}/delete-social`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }
}
