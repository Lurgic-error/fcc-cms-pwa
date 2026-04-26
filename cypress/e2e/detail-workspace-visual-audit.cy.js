const session = {
  accessToken: 'detail-visual-token',
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

const category = {
  categoryId: 'cat-001',
  systemKey: 'annual-reports',
  name: { en: 'Annual Reports', sw: 'Ripoti za Mwaka' },
  publicationStatus: 'published',
  effectiveStatus: 'published',
  validityType: 'rolling',
  publicationCount: 2,
  publishedPublicationCount: 1,
  createdAt: '2026-01-03T08:00:00.000Z',
  updatedAt: '2026-04-10T11:30:00.000Z',
  lastModifiedAt: '2026-04-12T09:00:00.000Z',
  approvedAt: '2026-03-04T09:00:00.000Z',
  publishedAt: '2026-03-10T10:00:00.000Z',
}

const publication = {
  publicationId: 'pub-001',
  categoryId: category.categoryId,
  category,
  name: { en: 'Annual Competition Report 2025', sw: 'Ripoti ya Ushindani 2025' },
  publicationStatus: 'published',
  effectiveStatus: 'published',
  issueDate: '2026-02-01T09:00:00.000Z',
  validFrom: '2026-02-05T09:00:00.000Z',
  validUntil: '2026-12-31T21:00:00.000Z',
  createdAt: '2026-01-01T09:00:00.000Z',
  updatedAt: '2026-04-10T09:00:00.000Z',
  lastModifiedAt: '2026-04-10T09:00:00.000Z',
  approvedAt: '2026-03-01T09:00:00.000Z',
  publishedAt: '2026-03-03T09:00:00.000Z',
}

const relatedPublications = [
  publication,
  {
    publicationId: 'pub-002',
    categoryId: category.categoryId,
    name: { en: 'Consumer Protection Update', sw: 'Taarifa ya Ulinzi wa Walaji' },
    publicationStatus: 'draft',
    effectiveStatus: 'draft',
    createdAt: '2026-02-10T09:00:00.000Z',
    lastModifiedAt: '2026-04-01T09:00:00.000Z',
  },
]

const commission = {
  commissionId: 'commission-001',
  publicationStatus: 'published',
  effectiveStatus: 'published',
  name: { en: 'Fair Competition Commission', sw: 'Tume ya Ushindani wa Haki' },
  slogan: { en: 'Fair markets. Confident consumers.', sw: 'Masoko ya haki. Walaji wenye imani.' },
  cta: {
    en: 'Report unfair conduct and request guidance.',
    sw: 'Ripoti mwenendo usio wa haki na omba mwongozo.',
  },
  welcomeNote: {
    en: 'Welcome to the commission profile and services workspace.',
    sw: 'Karibu kwenye wasifu wa tume na eneo la huduma.',
  },
  introduction: {
    en: 'The commission promotes fair competition and protects consumers.',
    sw: 'Tume inakuza ushindani wa haki na kulinda walaji.',
  },
  history: {
    en: 'The commission was established to strengthen market fairness and accountability.',
    sw: 'Tume ilianzishwa kuimarisha haki ya soko na uwajibikaji.',
  },
  outro: {
    en: 'Work with the commission to build a more transparent market.',
    sw: 'Shirikiana na tume kujenga soko lenye uwazi zaidi.',
  },
  coverImage: {
    path: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
  },
  mandate: {
    description: {
      en: 'The mandate explains how the commission regulates market conduct.',
      sw: 'Mandate inaeleza namna tume inavyodhibiti mwenendo wa soko.',
    },
    mandates: [
      {
        en: 'Investigate anti-competitive conduct and market abuse.',
        sw: 'Kuchunguza vitendo vya ushindani usio wa haki na matumizi mabaya ya soko.',
      },
    ],
  },
  commissionerStatement: {
    en: 'The commission remains committed to transparent and responsive regulation.',
    sw: 'Tume inaendelea kujitolea kwa udhibiti wenye uwazi na mwitikio.',
  },
  dgStatement: {
    en: 'We are strengthening institutional delivery through coordinated action.',
    sw: 'Tunaimarisha utoaji wa huduma za taasisi kupitia hatua zilizo ratibiwa.',
  },
  commissionFunctions: [
    {
      en: 'Provide public guidance on competition and consumer protection matters.',
      sw: 'Kutoa mwongozo wa umma kuhusu ushindani na ulinzi wa walaji.',
    },
  ],
  directorGeneral: {
    prefix: 'Dr.',
    firstName: 'Asha',
    surname: 'Mtema',
    email: 'director.general@fcc.go.tz',
    phoneNumber: '+255700000001',
    profilePicture: {
      path: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    },
    job: { en: 'Director General', sw: 'Mkurugenzi Mkuu' },
    statement: {
      en: 'A profile statement about regulatory leadership and service delivery.',
      sw: 'Taarifa ya wasifu kuhusu uongozi wa udhibiti na utoaji wa huduma.',
    },
    biography: {
      en: 'A longer English biography for the Director General profile.',
      sw: 'Wasifu mrefu wa Kiswahili kwa ukurasa wa Mkurugenzi Mkuu.',
    },
  },
  organizationStructure: {
    title: { en: 'Organization Structure', sw: 'Muundo wa Taasisi' },
    description: {
      en: 'A visual hierarchy for directorates, units, and reporting lines.',
      sw: 'Muundo wa kuona wa idara, vitengo, na mistari ya uwajibikaji.',
    },
    imageAlt: { en: 'Commission organization chart', sw: 'Chati ya muundo wa tume' },
    image: {
      path: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    },
  },
  images: [
    {
      path: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80',
    },
    {
      path: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80',
    },
  ],
  philosophies: [
    {
      philosophyId: 'phil-001',
      title: { en: 'Transparency', sw: 'Uwazi' },
      description: {
        en: 'We communicate regulatory decisions clearly and consistently.',
        sw: 'Tunawasilisha maamuzi ya udhibiti kwa uwazi na uthabiti.',
      },
      coverImage: {
        path: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=700&q=80',
      },
    },
  ],
  coreFunctions: [
    {
      coreFunctionId: 'core-001',
      name: { en: 'Enforcement', sw: 'Usimamizi' },
      description: {
        en: 'Investigate and resolve anti-competitive conduct across sectors.',
        sw: 'Kuchunguza na kutatua vitendo vya ushindani usio wa haki katika sekta mbalimbali.',
      },
      coverImage: {
        path: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=700&q=80',
      },
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

function stubCommonData() {
  cy.intercept('GET', /\/api\/v\d+\/users\/profile\/[^/?]+(?:\?.*)?$/, {
    statusCode: 200,
    body: { profile: adminProfile },
  }).as('profile')
}

function stubPublicationDetailRoutes() {
  cy.intercept('GET', /\/api\/v\d+\/publications\/pub-001(?:\?.*)?$/, {
    statusCode: 200,
    body: { publication },
  }).as('publicationDetail')

  cy.intercept('GET', /\/api\/v\d+\/publications\/categories\/cat-001(?:\?.*)?$/, {
    statusCode: 200,
    body: { category },
  }).as('categoryDetail')
}

function stubCategoryDetailRoutes() {
  cy.intercept('GET', /\/api\/v\d+\/publications\/categories\/cat-001(?:\?.*)?$/, {
    statusCode: 200,
    body: { category },
  }).as('categoryDetail')

  cy.intercept('GET', /\/api\/v\d+\/publications(?:\?.*)?$/, (req) => {
    if (req.query?.categoryId === category.categoryId) {
      req.reply({
        statusCode: 200,
        body: {
          publications: relatedPublications,
          items: relatedPublications,
          page: 1,
          limit: 10,
          total: relatedPublications.length,
          totalPages: 1,
        },
      })
      return
    }

    req.reply({
      statusCode: 200,
      body: {
        publications: [],
        items: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      },
    })
  }).as('relatedPublications')
}

function stubCommissionRoute(body) {
  cy.intercept('GET', /\/api\/v\d+\/commission(?:\?.*)?$/, {
    statusCode: 200,
    body,
  }).as('commission')
}

describe('Detail workspace visual audit', () => {
  beforeEach(() => {
    stubCommonData()
  })

  it('keeps the publication detail page responsive', () => {
    stubPublicationDetailRoutes()

    cy.viewport(1440, 960)
    visitWithSession('/publications/pub-001')
    cy.wait('@publicationDetail')
    cy.wait('@categoryDetail')
    cy.location('pathname').should('eq', '/publications/pub-001')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-publication-details-desktop')

    cy.viewport(390, 844)
    visitWithSession('/publications/pub-001')
    cy.wait('@publicationDetail')
    cy.wait('@categoryDetail')
    cy.location('pathname').should('eq', '/publications/pub-001')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-publication-details-mobile')
  })

  it('keeps the publication history page responsive', () => {
    stubPublicationDetailRoutes()

    cy.viewport(1440, 960)
    visitWithSession('/publications/pub-001/history')
    cy.wait('@publicationDetail')
    cy.location('pathname').should('eq', '/publications/pub-001/history')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-publication-history-desktop')

    cy.viewport(390, 844)
    visitWithSession('/publications/pub-001/history')
    cy.wait('@publicationDetail')
    cy.location('pathname').should('eq', '/publications/pub-001/history')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-publication-history-mobile')
  })

  it('keeps the publication category detail page responsive', () => {
    stubCategoryDetailRoutes()

    cy.viewport(1440, 960)
    visitWithSession('/publications/categories/cat-001')
    cy.wait('@categoryDetail')
    cy.wait('@relatedPublications')
    cy.location('pathname').should('eq', '/publications/categories/cat-001')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-publication-category-details-desktop')

    cy.viewport(390, 844)
    visitWithSession('/publications/categories/cat-001')
    cy.wait('@categoryDetail')
    cy.wait('@relatedPublications')
    cy.location('pathname').should('eq', '/publications/categories/cat-001')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-publication-category-details-mobile')
  })

  it('keeps the publication category history page responsive', () => {
    stubCategoryDetailRoutes()

    cy.viewport(1440, 960)
    visitWithSession('/publications/categories/cat-001/history')
    cy.wait('@categoryDetail')
    cy.location('pathname').should('eq', '/publications/categories/cat-001/history')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-publication-category-history-desktop')

    cy.viewport(390, 844)
    visitWithSession('/publications/categories/cat-001/history')
    cy.wait('@categoryDetail')
    cy.location('pathname').should('eq', '/publications/categories/cat-001/history')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-publication-category-history-mobile')
  })

  it('keeps the commission overview responsive with content loaded', () => {
    stubCommissionRoute({ commission })

    cy.viewport(1440, 960)
    visitWithSession('/commission')
    cy.wait('@commission')
    cy.location('pathname').should('eq', '/commission')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    assertNoHorizontalOverflow('.fcc-vertical-tabs')
    cy.get('.page-wrapper').screenshot('visual-commission-details-desktop')

    cy.viewport(390, 844)
    visitWithSession('/commission')
    cy.wait('@commission')
    cy.location('pathname').should('eq', '/commission')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-commission-details-mobile')
  })

  it('keeps the commission empty state responsive', () => {
    stubCommissionRoute({ commission: null })

    cy.viewport(1440, 960)
    visitWithSession('/commission')
    cy.wait('@commission')
    cy.location('pathname').should('eq', '/commission')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-commission-empty-desktop')

    cy.viewport(390, 844)
    visitWithSession('/commission')
    cy.wait('@commission')
    cy.location('pathname').should('eq', '/commission')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.enterprise-page-header')
    assertHeaderHasTwoInlineButtons()
    cy.get('.page-wrapper').screenshot('visual-commission-empty-mobile')
  })
})
