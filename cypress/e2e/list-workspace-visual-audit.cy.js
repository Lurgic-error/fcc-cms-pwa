const session = {
  accessToken: 'workspace-visual-token',
  userId: 'user-admin-001',
  role: 'admin',
  roles: ['admin'],
  permissions: ['create', 'update', 'delete', 'review', 'publish', 'archive'],
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

function assertHeaderHasTwoInlineButtons() {
  cy.get('.page-header-actions').should('be.visible')
  cy.get('.page-header-actions .el-button').should('have.length', 2)
  cy.get('.page-header-actions .el-button').then(($buttons) => {
    const firstTop = Math.round($buttons[0].getBoundingClientRect().top)
    const secondTop = Math.round($buttons[1].getBoundingClientRect().top)

    expect(Math.abs(firstTop - secondTop), 'header action buttons should stay inline').to.be.at.most(
      1,
    )
  })
}

describe('Workspace list and header visual audit', () => {
  it('keeps the shared article workspace header to two inline controls', () => {
    cy.viewport(1440, 960)
    visitWithSession('/articles')
    cy.wait(1500)
    cy.location('pathname').should('eq', '/articles')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-articles-list-desktop')

    cy.viewport(390, 844)
    visitWithSession('/articles')
    cy.wait(1500)
    cy.location('pathname').should('eq', '/articles')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-articles-list-mobile')
  })

  it('keeps the publications workspace header to two inline controls', () => {
    cy.viewport(1440, 960)
    visitWithSession('/publications')
    cy.wait(1500)
    cy.location('pathname').should('eq', '/publications')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-publications-workspace-desktop')

    cy.viewport(390, 844)
    visitWithSession('/publications')
    cy.wait(1500)
    cy.location('pathname').should('eq', '/publications')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-publications-workspace-mobile')
  })

  it('keeps the publication category workspace header to two inline controls', () => {
    cy.viewport(1440, 960)
    visitWithSession('/publications/categories')
    cy.wait(1500)
    cy.location('pathname').should('eq', '/publications/categories')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-publication-categories-desktop')

    cy.viewport(390, 844)
    visitWithSession('/publications/categories')
    cy.wait(1500)
    cy.location('pathname').should('eq', '/publications/categories')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-publication-categories-mobile')
  })

  it('keeps the commission overview header to two inline controls', () => {
    cy.viewport(1440, 960)
    visitWithSession('/commission')
    cy.wait(1500)
    cy.location('pathname').should('eq', '/commission')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-commission-overview-desktop')

    cy.viewport(390, 844)
    visitWithSession('/commission')
    cy.wait(1500)
    cy.location('pathname').should('eq', '/commission')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-commission-overview-mobile')
  })

  it('keeps the content management overview responsive with shared workspace chrome', () => {
    cy.viewport(1440, 960)
    visitWithSession('/content-management')
    cy.wait(1500)
    cy.location('pathname').should('eq', '/content-management')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-content-management-overview-desktop')

    cy.viewport(390, 844)
    visitWithSession('/content-management')
    cy.wait(1500)
    cy.location('pathname').should('eq', '/content-management')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-content-management-overview-mobile')
  })
})
