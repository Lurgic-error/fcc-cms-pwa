const session = {
  accessToken: 'page-header-visual-token',
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

const publication = {
  publicationId: 'pub-001',
  name: { en: 'Annual Competition Report 2025', sw: 'Ripoti ya Mwaka ya Ushindani 2025' },
  publicationStatus: 'draft',
  effectiveStatus: 'draft',
  createdAt: '2026-01-01T09:00:00.000Z',
  lastModifiedAt: '2026-04-10T09:00:00.000Z',
  approvedAt: '2026-03-01T09:00:00.000Z',
}

const category = {
  categoryId: 'cat-001',
  name: { en: 'Annual Reports', sw: 'Ripoti za Mwaka' },
  publicationStatus: 'draft',
  effectiveStatus: 'draft',
  createdAt: '2026-01-01T09:00:00.000Z',
  lastModifiedAt: '2026-04-12T09:00:00.000Z',
  approvedAt: '2026-03-04T09:00:00.000Z',
}

const publications = [
  publication,
  {
    publicationId: 'pub-002',
    name: { en: 'Consumer Advisory Notice', sw: 'Tangazo la Ushauri kwa Walaji' },
    publicationStatus: 'submitted',
    effectiveStatus: 'submitted',
  },
]

const categories = [
  category,
  {
    categoryId: 'cat-002',
    name: { en: 'Public Notices', sw: 'Matangazo ya Umma' },
    publicationStatus: 'submitted',
    effectiveStatus: 'submitted',
  },
]

const visitorSummary = {
  totalVisitors: 154,
  todayVisitors: 18,
  thisWeekVisitors: 67,
  thisMonthVisitors: 154,
  onlineVisitors: 6,
}

const visitorHotspots = {
  topPages: [
    { path: '/sw', views: 42 },
    { path: '/sw/publications', views: 27 },
  ],
  topReferrers: [
    { referrer: 'https://google.com', visits: 21 },
    { referrer: '', visits: 13 },
  ],
  topLocales: [
    { locale: 'sw', visits: 101 },
    { locale: 'en', visits: 53 },
  ],
  recentActivity: [
    {
      visitorId: 'visitor-001',
      path: '/sw/publications',
      visitedAt: '2026-04-15T08:00:00.000Z',
    },
    {
      visitorId: 'visitor-002',
      path: '/en/news',
      visitedAt: '2026-04-16T09:15:00.000Z',
    },
  ],
}

const visitors = [
  {
    visitorId: 'visitor-001',
    visitorToken: 'token-001',
    ipAddress: '196.41.45.12',
    visitCount: 8,
    pagesVisited: ['/sw', '/sw/publications'],
    firstVisitAt: '2026-04-01T08:00:00.000Z',
    lastVisit: '2026-04-15T08:00:00.000Z',
    isActive: true,
    userAgent: 'Mozilla/5.0',
  },
  {
    visitorId: 'visitor-002',
    visitorToken: 'token-002',
    ipAddress: '196.41.45.33',
    visitCount: 1,
    pagesVisited: ['/en/news'],
    firstVisitAt: '2026-04-16T09:15:00.000Z',
    lastVisit: '2026-04-16T09:15:00.000Z',
    isActive: false,
    userAgent: 'Mozilla/5.0',
  },
]

const commissionHistory = {
  en: 'The commission was established to promote fair competition and consumer welfare across Tanzania.',
  sw: 'Tume ilianzishwa kukuza ushindani wa haki na ustawi wa walaji kote Tanzania.',
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

function stubCommonData() {
  cy.intercept('GET', /\/api\/v\d+\/users\/profile\/[^/?]+(?:\?.*)?$/, {
    statusCode: 200,
    body: { profile: adminProfile },
  })
}

function stubPublicationDetail() {
  cy.intercept('GET', /\/api\/v\d+\/publications\/pub-001(?:\?.*)?$/, {
    statusCode: 200,
    body: { publication },
  })
}

function stubCategoryDetail() {
  cy.intercept('GET', /\/api\/v\d+\/publications\/categories\/cat-001(?:\?.*)?$/, {
    statusCode: 200,
    body: { category },
  })
}

function stubPublicationCategoriesList() {
  cy.intercept('GET', /\/api\/v\d+\/publications\/categories(?:\?.*)?$/, (req) => {
    req.reply({
      statusCode: 200,
      body: {
        categories,
        items: categories,
        page: 1,
        limit: 100,
        total: categories.length,
        totalPages: 1,
      },
    })
  })
}

function stubArchivedPublications() {
  cy.intercept('GET', /\/api\/v\d+\/publications\/archived(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      publications,
      items: publications,
      page: 1,
      limit: 20,
      total: publications.length,
      totalPages: 1,
    },
  })
}

function stubArchivedCategories() {
  cy.intercept('GET', /\/api\/v\d+\/publications\/categories\/archived(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      categories,
      items: categories,
      page: 1,
      limit: 20,
      total: categories.length,
      totalPages: 1,
    },
  })
}

function stubPublicationReviewQueues() {
  cy.intercept('GET', /\/api\/v\d+\/publications(?:\?.*)?$/, (req) => {
    const status = String(req.query?.publicationStatus || '')
    const items = status === 'approved' ? publications.slice(1) : [publications[0]]

    req.reply({
      statusCode: 200,
      body: {
        publications: items,
        items,
        page: 1,
        limit: 100,
        total: items.length,
        totalPages: 1,
      },
    })
  })
}

function stubCategoryReviewQueues() {
  cy.intercept('GET', /\/api\/v\d+\/publications\/categories(?:\?.*)?$/, (req) => {
    const status = String(req.query?.publicationStatus || '')
    const items = status === 'approved' ? categories.slice(1) : [categories[0]]

    req.reply({
      statusCode: 200,
      body: {
        categories: items,
        items,
        page: 1,
        limit: 100,
        total: items.length,
        totalPages: 1,
      },
    })
  })
}

function stubVisitorsWorkspace() {
  cy.intercept('GET', /\/api\/v\d+\/visitors\/summary(?:\?.*)?$/, {
    statusCode: 200,
    body: { summary: visitorSummary },
  })

  cy.intercept('GET', /\/api\/v\d+\/visitors\/hotspots(?:\?.*)?$/, {
    statusCode: 200,
    body: { hotspots: visitorHotspots },
  })

  cy.intercept('GET', /\/api\/v\d+\/visitors(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      visitors,
      page: 1,
      limit: 25,
      total: visitors.length,
      totalPages: 1,
    },
  })
}

function stubVisitorSummary() {
  cy.intercept('GET', /\/api\/v\d+\/visitors\/summary(?:\?.*)?$/, {
    statusCode: 200,
    body: { summary: visitorSummary },
  })
}

function stubCommissionHistory() {
  cy.intercept('GET', /\/api\/v\d+\/commission\/history(?:\?.*)?$/, {
    statusCode: 200,
    body: { history: commissionHistory },
  })
}

function assertNoHorizontalOverflow(selector) {
  cy.get(selector, { timeout: 10000 }).then(($element) => {
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
  cy.get('.page-header-actions', { timeout: 10000 }).should('be.visible')
  cy.get('.page-header-actions .el-button').should('have.length', 2)
  cy.get('.page-header-actions .el-button').then(($buttons) => {
    const firstTop = Math.round($buttons[0].getBoundingClientRect().top)
    const secondTop = Math.round($buttons[1].getBoundingClientRect().top)

    expect(
      Math.abs(firstTop - secondTop),
      'header action buttons should stay inline',
    ).to.be.at.most(1)
  })
}

function captureHeader(pathname, screenshotKey, setup = () => {}) {
  stubCommonData()
  setup()
  cy.viewport(1440, 960)
  visitWithSession(pathname)
  cy.wait(1500)
  cy.location('pathname').should('eq', pathname)
  cy.get('.page-header-actions', { timeout: 10000 }).should('exist')
  assertViewportFitsDocument()
  assertNoHorizontalOverflow('body')
  assertHeaderHasTwoInlineButtons()
  cy.get('body').screenshot(`${screenshotKey}-desktop`)

  stubCommonData()
  setup()
  cy.viewport(390, 844)
  visitWithSession(pathname)
  cy.wait(1500)
  cy.location('pathname').should('eq', pathname)
  cy.get('.page-header-actions', { timeout: 10000 }).should('exist')
  assertViewportFitsDocument()
  assertNoHorizontalOverflow('body')
  assertHeaderHasTwoInlineButtons()
  cy.get('body').screenshot(`${screenshotKey}-mobile`)
}

describe('Page header visual audit', () => {
  it('keeps the publication create header to two controls', () => {
    captureHeader('/publications/create', 'visual-publication-create-header', () => {
      stubPublicationCategoriesList()
    })
  })

  it('keeps the publication history header to two controls', () => {
    captureHeader('/publications/pub-001/history', 'visual-publication-history-header', () => {
      stubPublicationDetail()
    })
  })

  it('keeps the category history header to two controls', () => {
    captureHeader(
      '/publications/categories/cat-001/history',
      'visual-publication-category-history-header',
      () => {
        stubCategoryDetail()
      },
    )
  })

  it('keeps the publication archive header to two controls', () => {
    captureHeader('/publications/archive', 'visual-publication-archive-header', () => {
      stubArchivedPublications()
    })
  })

  it('keeps the category archive header to two controls', () => {
    captureHeader(
      '/publications/categories/archive',
      'visual-publication-category-archive-header',
      () => {
        stubArchivedCategories()
      },
    )
  })

  it('keeps the publication review queue header to two controls', () => {
    captureHeader('/publications/review-queue', 'visual-publication-review-header', () => {
      stubPublicationReviewQueues()
    })
  })

  it('keeps the category review queue header to two controls', () => {
    captureHeader(
      '/publications/categories/review-queue',
      'visual-publication-category-review-header',
      () => {
        stubCategoryReviewQueues()
      },
    )
  })

  it('keeps the content management overview header to two controls', () => {
    captureHeader('/content-management', 'visual-content-management-header')
  })

  it('keeps the visitors overview header to two controls', () => {
    captureHeader('/visitors', 'visual-visitors-header', () => {
      stubVisitorsWorkspace()
    })
  })

  it('keeps the visitor analytics header to two controls', () => {
    captureHeader('/visitors/analytics', 'visual-visitor-analytics-header', () => {
      stubVisitorSummary()
    })
  })

  it('keeps the commission history header to two controls', () => {
    captureHeader('/commission/history', 'visual-commission-history-header', () => {
      stubCommissionHistory()
    })
  })
})
