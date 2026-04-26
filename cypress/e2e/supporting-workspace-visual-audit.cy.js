const session = {
  accessToken: 'supporting-workspace-visual-token',
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

const visitorHotspots = {
  windowDays: 30,
  generatedAt: '2026-04-19T14:00:00.000Z',
  topPages: [
    {
      path: '/sw',
      views: 42,
      uniqueVisitors: 30,
      lastVisitedAt: '2026-04-19T12:30:00.000Z',
    },
    {
      path: '/sw/publications',
      views: 27,
      uniqueVisitors: 18,
      lastVisitedAt: '2026-04-18T10:00:00.000Z',
    },
  ],
  topReferrers: [
    { referrer: 'https://google.com', visits: 21 },
    { referrer: 'https://x.com/fcc', visits: 9 },
  ],
  topLocales: [
    { locale: 'sw', visits: 101 },
    { locale: 'en', visits: 53 },
  ],
  recentActivity: [
    {
      visitorId: 'visitor-001',
      path: '/sw/publications',
      locale: 'sw',
      visitedAt: '2026-04-19T12:30:00.000Z',
    },
    {
      visitorId: 'visitor-002',
      path: '/en/news',
      locale: 'en',
      visitedAt: '2026-04-19T11:15:00.000Z',
    },
  ],
}

const inquiry = {
  inquiryId: 'inquiry-001',
  status: 'pending',
  message:
    'Please clarify the current licensing requirements for a new broadcasting service application.',
  response: 'We are reviewing the application checklist and will respond with the latest guidance.',
  respondedAt: '2026-04-18T09:00:00.000Z',
  lastModifiedAt: '2026-04-19T08:30:00.000Z',
  sender: {
    fullName: 'Asha Mrema',
    email: 'asha.mrema@example.com',
    phoneNumber: '+255700000000',
  },
}

Cypress.on('uncaught:exception', (err) => {
  if (String(err?.message || '').includes('ResizeObserver loop completed with undelivered notifications')) {
    return false
  }

  return true
})

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
  })
}

describe('Supporting workspace visual audit', () => {
  it('keeps the visitor hotspots workspace responsive', () => {
    stubCommonData()
    cy.intercept('GET', /\/api\/v\d+\/visitors\/hotspots(?:\?.*)?$/, {
      statusCode: 200,
      body: { hotspots: visitorHotspots },
    }).as('visitorHotspots')

    cy.viewport(1440, 960)
    visitWithSession('/visitors/heatmap')
    cy.wait('@visitorHotspots')
    cy.location('pathname').should('eq', '/visitors/heatmap')
    cy.contains('Visitor Hotspots').should('be.visible')
    cy.get('.workspace-table .el-table').should('have.length', 4)
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    cy.screenshot('visual-visitor-hotspots-desktop', { capture: 'viewport' })

    cy.viewport(390, 844)
    visitWithSession('/visitors/heatmap')
    cy.wait('@visitorHotspots')
    cy.location('pathname').should('eq', '/visitors/heatmap')
    cy.contains('Visitor Hotspots').should('be.visible')
    cy.get('.workspace-table .el-table').should('have.length', 4)
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    cy.screenshot('visual-visitor-hotspots-mobile', { capture: 'viewport' })
  })

  it('keeps the inquiry response workspace responsive', () => {
    stubCommonData()
    cy.intercept('GET', /\/api\/v\d+\/inquiries\/inquiry-001(?:\?.*)?$/, {
      statusCode: 200,
      body: { inquiry },
    }).as('inquiryDetail')

    cy.viewport(1440, 960)
    visitWithSession('/inquiries/inquiry-001/response')
    cy.wait('@inquiryDetail')
    cy.location('pathname').should('eq', '/inquiries/inquiry-001/response')
    cy.contains('Respond to Inquiry').should('be.visible')
    cy.get('.workspace-message').should('contain.text', inquiry.message)
    cy.get('.el-textarea').its('length').should('be.gte', 1)
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    cy.screenshot('visual-inquiry-response-desktop', { capture: 'viewport' })

    cy.viewport(390, 844)
    visitWithSession('/inquiries/inquiry-001/response')
    cy.wait('@inquiryDetail')
    cy.location('pathname').should('eq', '/inquiries/inquiry-001/response')
    cy.contains('Respond to Inquiry').should('be.visible')
    cy.get('.workspace-message').should('contain.text', inquiry.message)
    cy.get('.el-textarea').its('length').should('be.gte', 1)
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    cy.screenshot('visual-inquiry-response-mobile', { capture: 'viewport' })
  })
})
