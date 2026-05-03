import { unwrapApiResponsePayload, wrapApiErrorResult } from './responseEnvelope'
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
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function findRole({ roleId }) {
    try {
      const { data } = await request.get(`${baseUrl}/${roleId}`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function createRole(payload = {}) {
    try {
      const { data } = await request.post(`${baseUrl}/create-role`, payload)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function updateRole({ roleId, ...payload }) {
    try {
      const { data } = await request.put(`${baseUrl}/${roleId}/update-role`, payload)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function deleteRole({ roleId }) {
    try {
      const { data } = await request.delete(`${baseUrl}/${roleId}`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }
}
