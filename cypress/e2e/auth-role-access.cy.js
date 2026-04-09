const enableServerE2E = Boolean(Cypress.env('ENABLE_SERVER_E2E'))
const apiBaseUrl = Cypress.env('API_BASE_URL') || 'http://localhost:4000/api/v1'
const adminEmail = Cypress.env('CMS_ADMIN_EMAIL')
const adminPassword = Cypress.env('CMS_ADMIN_PASSWORD')
const editorEmail = Cypress.env('CMS_EDITOR_EMAIL')
const editorPassword = Cypress.env('CMS_EDITOR_PASSWORD')
const reviewerEmail = Cypress.env('CMS_REVIEWER_EMAIL')
const reviewerPassword = Cypress.env('CMS_REVIEWER_PASSWORD')

const itIf = (condition) => (condition ? it : it.skip)

const ROUTE_MATRIX = Object.freeze([
  {
    label: 'roles module',
    path: '/roles',
    requiredRoles: ['admin'],
  },
  {
    label: 'system settings',
    path: '/system/settings',
    requiredRoles: ['admin'],
  },
  {
    label: 'event create',
    path: '/events/create',
    requiredRoles: ['admin', 'editor'],
    requiredPermissions: ['create'],
  },
  {
    label: 'publication review queue',
    path: '/publications/review-queue',
    requiredRoles: ['admin', 'reviewer'],
    requiredPermissions: ['review'],
  },
  {
    label: 'video archive',
    path: '/videos/archive',
    requiredRoles: ['admin'],
    requiredPermissions: ['archive'],
  },
])

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function hasRequiredRoles(session, requiredRoles = []) {
  if (!requiredRoles.length) return true
  const availableRoles = Array.isArray(session?.roles)
    ? session.roles.map(normalize)
    : [normalize(session?.role)].filter(Boolean)
  return requiredRoles.some((role) => availableRoles.includes(normalize(role)))
}

function hasRequiredPermissions(session, requiredPermissions = []) {
  if (!requiredPermissions.length) return true
  const permissions = Array.isArray(session?.permissions)
    ? session.permissions.map(normalize)
    : []
  return requiredPermissions.every((permission) => permissions.includes(normalize(permission)))
}

function assertRouteAccessForSession(session) {
  ROUTE_MATRIX.forEach((entry) => {
    const allowed =
      hasRequiredRoles(session, entry.requiredRoles || []) &&
      hasRequiredPermissions(session, entry.requiredPermissions || [])

    cy.visitWithCmsSession(entry.path, session)

    if (allowed) {
      cy.location('pathname').should('include', entry.path)
      return
    }

    cy.location('pathname').should('include', '/unauthorized')
  })
}

describe('Auth and role access (fcc-cms-server integration)', () => {
  beforeEach(() => {
    cy.resetSession()
  })

  it('redirects unauthenticated users to login', () => {
    cy.visit('/users')
    cy.url().should('include', '/auth/login')
  })

  itIf(enableServerE2E)(
    'rejects invalid login credentials through fcc-cms-server',
    () => {
      cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/users/login`,
        failOnStatusCode: false,
        body: {
          email: 'invalid.user@fcc.go.tz',
          password: 'InvalidPassword!123',
        },
      }).then((response) => {
        expect([400, 401, 404]).to.include(response.status)
      })
    },
  )

  itIf(enableServerE2E && Boolean(adminEmail && adminPassword))(
    'builds a valid server-backed admin session and enforces route access matrix',
    () => {
      cy.cmsApiLogin(adminEmail, adminPassword).then((session) => {
        expect(session.accessToken).to.be.a('string').and.not.be.empty
        expect(session.userId).to.be.a('string').and.not.be.empty
        assertRouteAccessForSession(session)
      })
    },
  )

  itIf(enableServerE2E && Boolean(editorEmail && editorPassword))(
    'builds a valid server-backed editor session and enforces route access matrix',
    () => {
      cy.cmsApiLogin(editorEmail, editorPassword).then((session) => {
        expect(session.accessToken).to.be.a('string').and.not.be.empty
        expect(session.userId).to.be.a('string').and.not.be.empty
        assertRouteAccessForSession(session)
      })
    },
  )

  itIf(enableServerE2E && Boolean(reviewerEmail && reviewerPassword))(
    'builds a valid server-backed reviewer session and enforces route access matrix',
    () => {
      cy.cmsApiLogin(reviewerEmail, reviewerPassword).then((session) => {
        expect(session.accessToken).to.be.a('string').and.not.be.empty
        expect(session.userId).to.be.a('string').and.not.be.empty
        assertRouteAccessForSession(session)
      })
    },
  )
})
