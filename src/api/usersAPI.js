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
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function fetchUser({ userId }) {
    try {
      const { data } = await request.get(`${baseUrl}/${userId}`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function fetchUserProfile({ userId }) {
    try {
      const { data } = await request.get(`${baseUrl}/profile/${userId}`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function createUser(payload = {}) {
    try {
      const { data } = await request.post(`${baseUrl}/create-user`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function updateUser({ userId, ...payload }) {
    try {
      const { data } = await request.put(`${baseUrl}/${userId}/update-user`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function changePassword({ userId, ...payload }) {
    try {
      const { data } = await request.put(`${baseUrl}/${userId}/change-password`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function forgotPassword({ email }) {
    try {
      const { data } = await request.post(`${baseUrl}/forgot-password`, { email })
      return data
    } catch (error) {
      return { error: parseError(error) }
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
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function validateRecoveryToken({ token }) {
    try {
      const { data } = await request.post(`${baseUrl}/validate-recovery-token`, { token })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function validateVerificationToken({ token }) {
    try {
      const { data } = await request.post(`${baseUrl}/validate-verification-token`, { token })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function validateActivationToken({ token }) {
    try {
      const { data } = await request.post(`${baseUrl}/validate-activation-token`, { token })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function activateUser({ userId }) {
    try {
      const { data } = await request.post(`${baseUrl}/activate-user`, { userId })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function deactivateUser({ userId }) {
    try {
      const { data } = await request.post(`${baseUrl}/deactivate-user`, { userId })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function loginUser({ email, password }) {
    try {
      const { data } = await request.post(`${baseUrl}/login`, { email, password })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function refreshToken() {
    try {
      const { data } = await request.get('/refresh-token', {
        headers: {
          'x-skip-auth': 'true',
        },
      })
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function logoutUser({ userId }) {
    try {
      const { data } = await request.patch(`${baseUrl}/${userId}/logout`)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function assignRole({ userId, ...payload }) {
    try {
      const { data } = await request.post(`${baseUrl}/${userId}/assign-role`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }

  async function removeRole({ userId, ...payload }) {
    try {
      const { data } = await request.post(`${baseUrl}/${userId}/remove-role`, payload)
      return data
    } catch (error) {
      return { error: parseError(error) }
    }
  }
}
