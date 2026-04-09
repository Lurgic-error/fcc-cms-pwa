function parseError(error) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    'Request failed.'
  )
}

export default function ({ request }) {
  const baseUrl = '/user-roles'

  return Object.freeze({
    listRoles,
    findRole,
    createRole,
    updateRole,
    deleteRole,
  })

  async function listRoles(query = {}) {
    try {
      const { data } = await request.get(baseUrl, { params: query })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function findRole({ roleId }) {
    try {
      const { data } = await request.get(`${baseUrl}/${roleId}`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function createRole(payload = {}) {
    try {
      const { data } = await request.post(`${baseUrl}/create-role`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function updateRole({ roleId, ...payload }) {
    try {
      const { data } = await request.put(`${baseUrl}/${roleId}/update-role`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function deleteRole({ roleId }) {
    try {
      const { data } = await request.delete(`${baseUrl}/${roleId}`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }
}
