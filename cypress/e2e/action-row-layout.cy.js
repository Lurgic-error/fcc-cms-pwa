const session = {
  accessToken: 'action-row-layout-token',
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

function assertButtonsStayInline(selector) {
  cy.get(`${selector} .el-button`).should('have.length.at.least', 2)
  cy.get(`${selector} .el-button`).then(($buttons) => {
    const referenceTop = Math.round($buttons[0].getBoundingClientRect().top)

    ;[...$buttons].forEach((button) => {
      const buttonTop = Math.round(button.getBoundingClientRect().top)
      expect(Math.abs(buttonTop - referenceTop), `${selector} should keep buttons on one row`).to.be.at.most(
        1,
      )
    })
  })
}

function assertNoHorizontalOverflow(selector) {
  cy.get(selector).then(($element) => {
    const { clientWidth, scrollWidth } = $element[0]
    expect(scrollWidth, `${selector} should stay within its row`).to.be.at.most(clientWidth + 1)
  })
}

function assertAlignedHeights(selectors, label) {
  cy.get(selectors.join(', ')).should('have.length.at.least', 2)
  cy.get(selectors.join(', ')).then(($elements) => {
    const referenceHeight = Math.round($elements[0].getBoundingClientRect().height)

    ;[...$elements].forEach((element) => {
      const elementHeight = Math.round(element.getBoundingClientRect().height)
      expect(
        Math.abs(elementHeight - referenceHeight),
        `${label} controls should share the same height`,
      ).to.be.at.most(1)
    })
  })
}

describe('Action row layout audit', () => {
  it('keeps dashboard shortcut buttons on one row', () => {
    cy.viewport(1440, 960)
    visitWithSession('/dashboard')
    cy.wait(1500)
    cy.location('pathname').should('eq', '/dashboard')

    assertButtonsStayInline('.dashboard-hero__actions')
    assertButtonsStayInline('.dashboard-panel__footer')
    assertNoHorizontalOverflow('.dashboard-hero__actions')
    assertNoHorizontalOverflow('.dashboard-panel__footer')

    cy.get('.dashboard-hero').screenshot('dashboard-action-row-desktop')
  })

  it('keeps overview filter actions inline and compact', () => {
    cy.viewport(1440, 960)
    visitWithSession('/events')
    cy.wait(1500)
    cy.location('pathname').should('eq', '/events')

    assertButtonsStayInline('.overview-filter-bar__actions')
    assertNoHorizontalOverflow('.overview-filter-bar__actions')

    cy.get('.overview-filter-bar').then(($bar) => {
      const barHeight = Math.round($bar[0].getBoundingClientRect().height)
      expect(barHeight, 'overview filter bar should stay compact').to.be.lessThan(240)
    })

    cy.get('.overview-filter-bar').screenshot('overview-filter-bar-desktop')
  })

  it('keeps the services filter bar full width with the activity panel below it', () => {
    cy.viewport(1440, 960)
    visitWithSession('/services')
    cy.wait(1500)
    cy.location('pathname').should('eq', '/services')

    cy.get('.enterprise-list-toolbar').should('be.visible')
    cy.get('.enterprise-list-toolbar__filter').then(($filter) => {
      cy.get('.enterprise-list-toolbar').then(($toolbar) => {
        const filterWidth = $filter[0].getBoundingClientRect().width
        const toolbarWidth = $toolbar[0].getBoundingClientRect().width

        expect(filterWidth, 'services filter bar should use the full toolbar width').to.be.greaterThan(
          toolbarWidth * 0.94,
        )
      })
    })

    cy.get('.enterprise-list-toolbar__support').then(($support) => {
      cy.get('.enterprise-list-toolbar__filter').then(($filter) => {
        const supportTop = Math.round($support[0].getBoundingClientRect().top)
        const filterBottom = Math.round($filter[0].getBoundingClientRect().bottom)

        expect(supportTop, 'services activity panel should sit below the filter bar').to.be.greaterThan(
          filterBottom - 1,
        )
      })
    })

    assertButtonsStayInline('.overview-filter-bar__actions')
    assertNoHorizontalOverflow('.overview-filter-bar__actions')
    assertAlignedHeights(
      [
        '.overview-filter-bar .el-input__wrapper',
        '.overview-filter-bar .el-select__wrapper',
        '.overview-filter-bar .el-button',
      ],
      'services filter bar',
    )
    cy.get('.enterprise-list-toolbar').screenshot('services-filter-layout-desktop')
  })

  it('keeps visitor analytics controls aligned in the shared filter surface', () => {
    cy.viewport(1440, 960)
    visitWithSession('/visitors')
    cy.wait(1500)
    cy.location('pathname').should('eq', '/visitors')

    assertNoHorizontalOverflow('.enterprise-filter-surface')
    assertAlignedHeights(
      [
        '.enterprise-filter-surface .el-select__wrapper',
        '.enterprise-filter-surface .el-button',
      ],
      'visitor analytics controls',
    )

    cy.get('.enterprise-filter-surface').screenshot('visitors-analytics-toolbar-desktop')
  })

  it('keeps publication workspace filters aligned and actions inline', () => {
    cy.viewport(1440, 960)
    visitWithSession('/publications')
    cy.wait(1500)
    cy.location('pathname').should('eq', '/publications')

    assertNoHorizontalOverflow('.overview-filter-bar')
    assertButtonsStayInline('.overview-filter-bar__actions')
    assertAlignedHeights(
      [
        '.overview-filter-bar .el-input__wrapper',
        '.overview-filter-bar .el-select__wrapper',
        '.overview-filter-bar .el-button',
      ],
      'publications filter bar',
    )

    cy.get('.overview-filter-bar').screenshot('publications-filter-bar-desktop')
  })

  it('keeps publication category filters aligned and actions inline', () => {
    cy.viewport(1440, 960)
    visitWithSession('/publications/categories')
    cy.wait(1500)
    cy.location('pathname').should('eq', '/publications/categories')

    assertNoHorizontalOverflow('.overview-filter-bar')
    assertButtonsStayInline('.overview-filter-bar__actions')
    assertAlignedHeights(
      [
        '.overview-filter-bar .el-input__wrapper',
        '.overview-filter-bar .el-select__wrapper',
        '.overview-filter-bar .el-button',
      ],
      'publication category filter bar',
    )

    cy.get('.overview-filter-bar').screenshot('publication-categories-filter-bar-desktop')
  })
})
