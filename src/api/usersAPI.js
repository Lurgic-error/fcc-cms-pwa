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
  const baseUrl = '/users'

  return Object.freeze({
    fetchUsers,
    fetchUser,
    fetchUserProfile,
    createUser,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,
    validateRecoveryToken,
    validateVerificationToken,
    validateActivationToken,
    activateUser,
    deactivateUser,
    loginUser,
    refreshToken,
    logoutUser,
    assignRole,
    removeRole,
  })

  async function fetchUsers(query = {}) {
    try {
      const { data } = await request.get(baseUrl, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function fetchUser({ userId }) {
    try {
      const { data } = await request.get(`${baseUrl}/${userId}`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function fetchUserProfile({ userId }) {
    try {
      const { data } = await request.get(`${baseUrl}/profile/${userId}`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function createUser(payload = {}) {
    try {
      const { data } = await request.post(`${baseUrl}/create-user`, payload)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function updateUser({ userId, ...payload }) {
    try {
      const { data } = await request.put(`${baseUrl}/${userId}/update-user`, payload)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function changePassword({ userId, ...payload }) {
    try {
      const { data } = await request.put(`${baseUrl}/${userId}/change-password`, payload)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function forgotPassword({ email }) {
    try {
      const { data } = await request.post(`${baseUrl}/forgot-password`, { email })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function resetPassword({ email, token, password, confirmedPassword }) {
    try {
      const { data } = await request.post(`${baseUrl}/reset-password`, {
        email,
        token,
        password,
        confirmedPassword,
      })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function validateRecoveryToken({ token }) {
    try {
      const { data } = await request.post(`${baseUrl}/validate-recovery-token`, { token })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function validateVerificationToken({ token }) {
    try {
      const { data } = await request.post(`${baseUrl}/validate-verification-token`, { token })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function validateActivationToken({ token }) {
    try {
      const { data } = await request.post(`${baseUrl}/validate-activation-token`, { token })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function activateUser({ userId }) {
    try {
      const { data } = await request.post(`${baseUrl}/activate-user`, { userId })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function deactivateUser({ userId }) {
    try {
      const { data } = await request.post(`${baseUrl}/deactivate-user`, { userId })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function loginUser({ email, password }) {
    try {
      const { data } = await request.post(`${baseUrl}/login`, { email, password })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function refreshToken() {
    try {
      const { data } = await request.get('/refresh-token', {
        headers: {
          'x-skip-auth': 'true',
        },
      })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function logoutUser({ userId }) {
    try {
      const { data } = await request.patch(`${baseUrl}/${userId}/logout`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function assignRole({ userId, ...payload }) {
    try {
      const { data } = await request.post(`${baseUrl}/${userId}/assign-role`, payload)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }

  async function removeRole({ userId, ...payload }) {
    try {
      const { data } = await request.post(`${baseUrl}/${userId}/remove-role`, payload)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseError)
    }
  }
}
