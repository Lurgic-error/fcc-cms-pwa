const session = {
  accessToken: 'shared-surface-sections-token',
  userId: 'user-admin-001',
  role: 'admin',
  roles: ['admin'],
  permissions: ['create', 'update', 'delete', 'review', 'publish', 'archive'],
}

const adminProfile = {
  userId: 'user-admin-001',
  firstName: 'Visual',
  lastName: 'Auditor',
  email: 'visual.auditor@test.fcc.go.tz',
  roles: [
    {
      name: 'admin',
      permissions: [
        { name: 'create' },
        { name: 'update' },
        { name: 'delete' },
        { name: 'review' },
        { name: 'publish' },
        { name: 'archive' },
      ],
    },
  ],
}

function visitWithSession(pathname) {
  cy.visit(pathname, {
    onBeforeLoad(win) {
      win.localStorage.setItem('fcc-cms-session', JSON.stringify(session))
    },
  })
}

function assertNoHorizontalOverflow(selector) {
  cy.get(selector).then(($element) => {
    const { clientWidth, scrollWidth } = $element[0]
    expect(scrollWidth, `${selector} should not overflow horizontally`).to.be.at.most(
      clientWidth + 1,
    )
  })
}

function assertViewportFitsDocument() {
  cy.document().then((doc) => {
    expect(
      doc.documentElement.scrollWidth,
      'document should not overflow the viewport horizontally',
    ).to.be.at.most(doc.documentElement.clientWidth + 1)
  })
}

function stubCommonData() {
  cy.intercept('GET', /\/api\/v\d+\/users\/profile\/[^/?]+(?:\?.*)?$/, {
    statusCode: 200,
    body: { profile: adminProfile },
  }).as('profile')
}

describe('Shared surface section audit', () => {
  beforeEach(() => {
    stubCommonData()
  })

  it('keeps the generic resource action shell stable', () => {
    cy.viewport(1280, 720)
    visitWithSession('/system/settings')
    cy.wait('@profile')
    cy.location('pathname').should('eq', '/system/settings')
    cy.contains('Action Workspace').should('be.visible')
    cy.contains('Workflow Guidance').should('be.visible')
    cy.get('.app-surface-section').should('have.length.at.least', 3)
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.app-shell__content')
    cy.screenshot('shared-surface-resource-action', { capture: 'viewport' })
  })

  it('keeps the generic schema form shell stable', () => {
    cy.viewport(1280, 720)
    visitWithSession('/roles/create')
    cy.wait('@profile')
    cy.location('pathname').should('eq', '/roles/create')
    cy.contains('Create Role').should('be.visible')
    cy.get('.app-surface-section').should('have.length.at.least', 1)
    cy.get('.entity-schema-form__actions .el-button').should('have.length', 2)
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.app-shell__content')
    cy.screenshot('shared-surface-entity-form', { capture: 'viewport' })
  })
})
