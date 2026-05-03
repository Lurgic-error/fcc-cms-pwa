const publisherSession = Object.freeze({
  accessToken: 'test-token',
  userId: 'publisher-001',
  role: 'publisher',
  roles: ['publisher'],
  permissions: ['create', 'update', 'delete', 'review', 'publish', 'archive'],
})

describe('System audit UI', () => {
  beforeEach(() => {
    cy.resetSession()
  })

  it('loads the role-gated audit page through the single filtered endpoint', () => {
    cy.intercept('GET', '**/admin/audit*', {
      statusCode: 200,
      body: {
        data: {
          items: [
            {
              auditLogId: 'aud-001',
              action: 'message.delete',
              actor: { userId: 'publisher-001', email: 'publisher@example.test' },
              resource: { type: 'message', id: 'msg-001' },
              result: 'success',
              ip: '127.0.0.1',
              userAgent: 'Mozilla/5.0',
              createdAt: '2026-05-03T08:00:00.000Z',
            },
          ],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
        error: null,
      },
    }).as('auditList')

    cy.visitWithCmsSession('/system/audit', publisherSession)

    cy.wait('@auditList').its('request.url').should('include', '/admin/audit')
    cy.contains('h1', 'Audit').should('be.visible')
    cy.contains('td', 'message.delete').should('be.visible')
    cy.contains('td', 'message:msg-001').should('be.visible')
    cy.contains('td', '[redacted]').should('be.visible')
  })
})
