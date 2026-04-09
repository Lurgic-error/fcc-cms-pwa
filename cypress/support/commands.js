Cypress.Commands.add('cmsApiLogin', (email, password) => {
  const apiBaseUrl = Cypress.env('API_BASE_URL') || 'http://localhost:4000/api/v1'

  const normalize = (value) =>
    String(value || '')
      .trim()
      .toLowerCase()

  const toRoleName = (value) => {
    if (typeof value === 'string') return normalize(value)
    return normalize(value?.name)
  }

  const toPermissionName = (value) => {
    if (typeof value === 'string') return normalize(value)
    return normalize(value?.name)
  }

  const extractUserId = (body = {}) => {
    return body?.userId || body?.user?.userId || body?.profile?.userId || ''
  }

  const extractAccessToken = (body = {}) => {
    return body?.accessToken || body?.token || ''
  }

  const extractRolesAndPermissions = (profile = {}) => {
    const profileRoles = Array.isArray(profile?.roles) ? profile.roles : []
    const roleNames = [...new Set(profileRoles.map(toRoleName).filter(Boolean))]

    const directPermissions = Array.isArray(profile?.permissions)
      ? profile.permissions.map(toPermissionName).filter(Boolean)
      : []

    const rolePermissions = profileRoles.flatMap((roleEntry) => {
      const permissions = Array.isArray(roleEntry?.permissions) ? roleEntry.permissions : []
      return permissions.map(toPermissionName).filter(Boolean)
    })

    const permissions = [...new Set([...directPermissions, ...rolePermissions])]
    return {
      role: roleNames[0] || '',
      roles: roleNames,
      permissions,
    }
  }

  return cy
    .request({
      method: 'POST',
      url: `${apiBaseUrl}/users/login`,
      body: { email, password },
      failOnStatusCode: false,
    })
    .then((loginResponse) => {
      if (loginResponse.status < 200 || loginResponse.status >= 300) {
        throw new Error(`API login failed (${loginResponse.status}) for ${email}`)
      }

      const accessToken = extractAccessToken(loginResponse.body)
      const userId = extractUserId(loginResponse.body)

      if (!accessToken || !userId) {
        throw new Error('Login response is missing accessToken or userId.')
      }

      return cy
        .request({
          method: 'GET',
          url: `${apiBaseUrl}/users/profile/${userId}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-access-token': accessToken,
          },
          failOnStatusCode: false,
        })
        .then((profileResponse) => {
          if (profileResponse.status < 200 || profileResponse.status >= 300) {
            throw new Error(
              `Failed to fetch user profile (${profileResponse.status}) for user ${userId}`,
            )
          }

          const profile = profileResponse.body?.profile || profileResponse.body?.user || null
          const { role, roles, permissions } = extractRolesAndPermissions(profile || {})

          return {
            accessToken,
            userId,
            role,
            roles,
            permissions,
            profile,
          }
        })
    })
})

Cypress.Commands.add('cmsLogin', (email, password) => {
  cy.visit('/auth/login')
  cy.get('input[name="email"]').clear()
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').clear()
  cy.get('input[name="password"]').type(password)
  cy.contains('button', 'Sign In').click()
})

Cypress.Commands.add('visitWithCmsSession', (path, session) => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem('fcc-cms-session', JSON.stringify(session))
    },
  })
})

Cypress.Commands.add('resetSession', () => {
  cy.clearCookies()
  cy.clearLocalStorage()
})
