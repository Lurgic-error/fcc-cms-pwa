function parseError(error) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    'Request failed.'
  )
}

export default function ({ request }) {
  const url = '/committees'

  return Object.freeze({
    listCommittees,
    listPublishedCommittees,
    findCommittee,
    createCommittee,
    updateCommittee,
    deleteCommittee,
  })

  async function listCommittees(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function listPublishedCommittees(query = {}) {
    try {
      const { data } = await request.get(`${url}/published`, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function findCommittee({ committeeId }) {
    try {
      const { data } = await request.get(`${url}/${committeeId}`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function createCommittee(payload = {}) {
    const body = payload.committeeInfo || payload
    try {
      const { data } = await request.post(`${url}/register-committee`, body)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function updateCommittee({ committeeId, ...payload }) {
    const body = payload.committeeInfo || payload
    try {
      const { data } = await request.put(`${url}/${committeeId}/update-committee`, body)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function deleteCommittee({ committeeId }) {
    try {
      const { data } = await request.delete(`${url}/${committeeId}/delete-committee`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }
}
