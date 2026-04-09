const enableServerE2E = Boolean(Cypress.env('ENABLE_SERVER_E2E'))
const apiBaseUrl = Cypress.env('API_BASE_URL') || 'http://localhost:4000/api/v1'
const adminEmail = Cypress.env('CMS_ADMIN_EMAIL')
const adminPassword = Cypress.env('CMS_ADMIN_PASSWORD')

const itIf = (condition) => (condition ? it : it.skip)

const MODULE_ROUTES = Object.freeze([
  '/assets',
  '/photos',
  '/subscribers',
  '/subscribers/segments',
  '/commission',
  '/commission/history',
  '/dashboard/summary',
  '/dashboard/analytics',
  '/visitors/heatmap',
  '/system/activity-log',
])

const WORKFLOW_FIELDS = Object.freeze(['publicationStatus', 'status', 'workflowState', 'state'])

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function resolveWorkflowState(record = {}) {
  for (const field of WORKFLOW_FIELDS) {
    if (record?.[field]) return normalize(record[field])
  }

  return ''
}

function findByWorkflowStates(records = [], acceptedStates = []) {
  const lookup = acceptedStates.map(normalize)
  return records.find((record) => lookup.includes(resolveWorkflowState(record))) || null
}

describe('Module resource/action flows (fcc-cms-server integration)', () => {
  beforeEach(() => {
    cy.resetSession()
  })

  itIf(enableServerE2E && Boolean(adminEmail && adminPassword))(
    'loads migrated resource modules with an admin session',
    () => {
      cy.cmsApiLogin(adminEmail, adminPassword).then((session) => {
        MODULE_ROUTES.forEach((path) => {
          cy.visitWithCmsSession(path, session)
          cy.location('pathname').should('include', path)
          cy.location('pathname').should('not.include', '/unauthorized')
        })
      })
    },
  )

  itIf(enableServerE2E && Boolean(adminEmail && adminPassword))(
    'enforces publication workflow states on edit/schedule transitions',
    () => {
      cy.cmsApiLogin(adminEmail, adminPassword).then((session) => {
        const headers = {
          Authorization: `Bearer ${session.accessToken}`,
          'x-access-token': session.accessToken,
        }

        cy.request({
          method: 'GET',
          url: `${apiBaseUrl}/publications`,
          headers,
          qs: { page: 1, limit: 50 },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.be.within(200, 299)

          const records = response.body?.publications || response.body?.items || []
          const draftLike = findByWorkflowStates(records, ['draft', 'rejected'])
          const approvedLike = findByWorkflowStates(records, ['approved'])

          if (!draftLike && !approvedLike) {
            cy.log('No publication records found in draft/rejected/approved states; skipping guarded assertions.')
            return
          }

          if (draftLike?.publicationId) {
            cy.visitWithCmsSession(`/publications/${draftLike.publicationId}/edit`, session)
            cy.location('pathname').should('include', `/publications/${draftLike.publicationId}/edit`)
          }

          if (approvedLike?.publicationId) {
            cy.visitWithCmsSession(`/publications/${approvedLike.publicationId}/edit`, session)
            cy.location('pathname').should('include', '/unauthorized')

            cy.visitWithCmsSession(`/publications/${approvedLike.publicationId}/schedule`, session)
            cy.location('pathname').should('include', `/publications/${approvedLike.publicationId}/schedule`)
          }

          if (draftLike?.publicationId) {
            cy.visitWithCmsSession(`/publications/${draftLike.publicationId}/schedule`, session)
            cy.location('pathname').should('include', '/unauthorized')
          }
        })
      })
    },
  )
})
