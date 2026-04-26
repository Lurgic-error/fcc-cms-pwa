const session = {
  accessToken: 'editorial-visual-token',
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

const article = {
  articleId: 'art-001',
  title: {
    en: 'Fair Competition Commission issues market guidance update',
    sw: 'Tume ya Ushindani wa Haki yatoa taarifa mpya ya mwongozo wa soko',
  },
  description: {
    en: 'An editorial summary describing the latest market guidance and enforcement direction.',
    sw: 'Muhtasari wa habari unaoelezea mwongozo wa soko na mwelekeo wa usimamizi.',
  },
  body: {
    en: 'Long-form English article body covering market conduct, sector context, and editorial framing.',
    sw: 'Maudhui marefu ya Kiswahili yanayofafanua mwenendo wa soko, muktadha wa sekta, na uwasilishaji wa habari.',
  },
  slug: 'market-guidance-update',
  tags: ['competition', 'guidance', 'markets'],
  publicationStatus: 'draft',
  isBulletin: true,
  featureRequested: true,
}

const event = {
  eventId: 'evt-001',
  title: 'Fair Market Awareness Forum',
  description:
    'A public-facing event focused on competition awareness, consumer rights, and regulatory updates.',
  eventType: 'conference',
  coverImage: {
    fileId: 'event-cover-001',
    name: 'ushindani-house.png',
    url: '/src/assets/ushindani-house.png',
  },
  targetAudience: ['Consumers', 'Businesses', 'Regulators'],
  tags: ['forum', 'competition', 'consumer protection'],
  publicationStatus: 'draft',
  isFeatured: true,
  occurrences: [
    {
      startDate: '2026-05-14',
      endDate: '2026-05-15',
      venue: {
        name: 'FCC Conference Hall',
        location: 'Dodoma, Tanzania',
      },
    },
  ],
  schedule: [
    {
      title: 'Opening Session',
      speaker: 'Director General',
      startTime: '08:30',
      endTime: '09:30',
      description: 'Opening remarks, policy context, and event overview.',
    },
    {
      title: 'Consumer Protection Panel',
      speaker: 'Commission Secretariat',
      startTime: '10:00',
      endTime: '11:30',
      description: 'Panel discussion on complaints, investigations, and market remedies.',
    },
  ],
  sponsors: [
    {
      name: 'National Business Council',
      contribution: 'Venue support and event outreach.',
      website: 'https://example.org/nbc',
    },
  ],
  guestOfHonors: [
    {
      name: 'Hon. Amina K.',
      title: 'Minister',
      organization: 'Ministry of Industry and Trade',
      notes: 'Guest of honor for the opening ceremony.',
    },
  ],
  specialGuests: [
    {
      name: 'John M.',
      title: 'CEO',
      organization: 'Tanzania Chamber',
      notes: 'Private sector representative.',
    },
  ],
}

const publicationCategories = [
  {
    _id: 'cat-001',
    categoryId: 'cat-001',
    name: {
      en: 'Annual Reports',
      sw: 'Ripoti za Mwaka',
    },
    publicationCount: 4,
    effectiveStatus: 'published',
  },
  {
    _id: 'cat-002',
    categoryId: 'cat-002',
    name: {
      en: 'Public Notices',
      sw: 'Matangazo ya Umma',
    },
    publicationCount: 2,
    effectiveStatus: 'draft',
  },
]

const publication = {
  publicationId: 'pub-001',
  name: {
    en: 'Annual Competition Report 2025',
    sw: 'Ripoti ya Mwaka ya Ushindani 2025',
  },
  description: {
    en: 'The annual publication summarizing regulatory work, enforcement, and market analysis.',
    sw: 'Chapisho la mwaka linalofupisha kazi za udhibiti, usimamizi, na uchambuzi wa soko.',
  },
  category: {
    _id: 'cat-001',
    categoryId: 'cat-001',
    name: {
      en: 'Annual Reports',
      sw: 'Ripoti za Mwaka',
    },
  },
  tags: ['report', 'annual', 'competition'],
  issueDate: '2026-01-31T00:00:00.000Z',
  validFrom: '2026-02-01T00:00:00.000Z',
  validUntil: '2026-12-31T00:00:00.000Z',
  publicationStatus: 'draft',
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

function stubEditorialShell() {
  cy.intercept('GET', '**/users/profile/**', {
    statusCode: 200,
    body: { profile: adminProfile },
  }).as('profile')

  cy.intercept('GET', '**/articles/art-001', {
    statusCode: 200,
    body: { article },
  }).as('article')

  cy.intercept('GET', '**/events/evt-001', {
    statusCode: 200,
    body: { event },
  }).as('event')

  cy.intercept('GET', '**/publications/pub-001', {
    statusCode: 200,
    body: { publication },
  }).as('publication')

  cy.intercept('GET', '**/publications/categories*', {
    statusCode: 200,
    body: {
      categories: publicationCategories,
      page: 1,
      limit: 200,
      total: publicationCategories.length,
      totalPages: 1,
    },
  }).as('publicationCategories')
}

describe('Editorial visual audit screenshots', () => {
  it('captures the article edit wizard with top navigation', () => {
    stubEditorialShell()

    cy.viewport(1440, 960)
    visitWithSession('/articles/art-001/edit')
    cy.wait('@profile')
    cy.wait('@article')
    cy.contains('Step 1 of 3').should('be.visible')
    cy.get('.wizard-shell__nav--top').should('exist')
    cy.get('.wizard-shell__nav--side').should('not.exist')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.wizard-shell')
    assertNoHorizontalOverflow('.wizard-shell__content-scroll')
    assertNoHorizontalOverflow('.wizard-shell__footer')
    cy.get('.wizard-shell').screenshot('visual-article-edit-basic-desktop')

    cy.contains('.wizard-shell__footer .el-button', 'Next').click()
    cy.get('.wizard-shell').scrollIntoView()
    cy.get('.wizard-shell__nav--top .wizard-step.is-current')
      .contains('Summary and Body')
      .should('be.visible')
    cy.contains('Summary (English)').should('be.visible')
    assertNoHorizontalOverflow('.wizard-shell')
    assertNoHorizontalOverflow('.wizard-shell__content-scroll')
    cy.get('.wizard-shell').screenshot('visual-article-edit-summary-desktop')

    cy.viewport(390, 844)
    visitWithSession('/articles/art-001/edit')
    cy.wait('@profile')
    cy.wait('@article')
    cy.contains('Step 1 of 3').should('be.visible')
    cy.get('.wizard-shell__nav--top').should('exist')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.wizard-shell')
    assertNoHorizontalOverflow('.wizard-shell__content-scroll')
    assertNoHorizontalOverflow('.wizard-shell__footer')
    cy.get('.wizard-shell').screenshot('visual-article-edit-basic-mobile')
  })

  it('captures the event edit wizard with side navigation', () => {
    stubEditorialShell()

    cy.viewport(1440, 960)
    visitWithSession('/events/evt-001/edit')
    cy.wait('@profile')
    cy.wait('@event')
    cy.contains('Step 1 of 5').should('be.visible')
    cy.get('.wizard-shell__nav--side').should('exist')
    cy.get('.wizard-shell__nav--top').should('not.exist')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.wizard-shell')
    assertNoHorizontalOverflow('.wizard-shell__content-scroll')
    assertNoHorizontalOverflow('.wizard-shell__footer')
    cy.get('.wizard-shell').screenshot('visual-event-edit-basic-desktop')

    cy.contains('.wizard-shell__footer .el-button', 'Next').click()
    cy.get('.wizard-shell').scrollIntoView()
    cy.get('.wizard-shell__nav--side .wizard-step.is-current')
      .contains('Event Venue and Schedule')
      .should('be.visible')
    cy.contains('Add occurrence').should('be.visible')
    assertNoHorizontalOverflow('.wizard-shell')
    assertNoHorizontalOverflow('.wizard-shell__content-scroll')
    cy.get('.wizard-shell').screenshot('visual-event-edit-schedule-desktop')

    cy.contains('.wizard-shell__footer .el-button', 'Next').click()
    cy.get('.wizard-shell').scrollIntoView()
    cy.get('.wizard-shell__nav--side .wizard-step.is-current')
      .contains('Event Sponsors')
      .should('be.visible')
    cy.contains('Add sponsor').should('be.visible')
    assertNoHorizontalOverflow('.wizard-shell')
    assertNoHorizontalOverflow('.wizard-shell__content-scroll')
    cy.get('.wizard-shell').screenshot('visual-event-edit-sponsors-desktop')

    cy.viewport(390, 844)
    visitWithSession('/events/evt-001/edit')
    cy.wait('@profile')
    cy.wait('@event')
    cy.contains('Step 1 of 5').should('be.visible')
    cy.get('.wizard-shell__nav--side').should('exist')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.wizard-shell')
    assertNoHorizontalOverflow('.wizard-shell__content-scroll')
    assertNoHorizontalOverflow('.wizard-shell__footer')
    cy.get('.wizard-shell').screenshot('visual-event-edit-basic-mobile')
  })

  it('captures the publication edit form workspace', () => {
    stubEditorialShell()

    cy.viewport(1440, 960)
    visitWithSession('/publications/pub-001/edit')
    cy.wait('@profile')
    cy.wait('@publication')
    cy.wait('@publicationCategories')
    cy.contains('Edit Publication').should('be.visible')
    cy.get('.wizard-shell').should('not.exist')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.surface-card')
    cy.get('.app-shell__content').scrollTo('top')
    cy.get('.app-shell__content').screenshot('visual-publication-edit-desktop')

    cy.contains('PDF Attachments').scrollIntoView()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.surface-card')
    cy.get('.app-shell__content').screenshot('visual-publication-edit-supporting-materials-desktop')

    cy.viewport(390, 844)
    visitWithSession('/publications/pub-001/edit')
    cy.wait('@profile')
    cy.wait('@publication')
    cy.wait('@publicationCategories')
    cy.contains('Edit Publication').should('be.visible')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    assertNoHorizontalOverflow('.surface-card')
    cy.get('.app-shell__content').scrollTo('top')
    cy.get('.app-shell__content').screenshot('visual-publication-edit-mobile')
  })
})
