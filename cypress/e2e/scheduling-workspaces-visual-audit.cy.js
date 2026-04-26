const session = {
  accessToken: 'scheduling-visual-token',
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
    en: 'Fair competition market guidance update',
    sw: 'Taarifa ya mwongozo wa soko la ushindani wa haki',
  },
  publicationStatus: 'approved',
}

const event = {
  eventId: 'evt-001',
  title: 'Fair Market Awareness Forum',
  publicationStatus: 'published',
}

const publication = {
  publicationId: 'pub-001',
  name: {
    en: 'Annual Competition Report 2025',
    sw: 'Ripoti ya Mwaka ya Ushindani 2025',
  },
  publicationStatus: 'approved',
  category: {
    categoryId: 'cat-001',
    name: {
      en: 'Annual Reports',
      sw: 'Ripoti za Mwaka',
    },
  },
}

const category = {
  categoryId: 'cat-001',
  name: {
    en: 'Annual Reports',
    sw: 'Ripoti za Mwaka',
  },
  publicationStatus: 'approved',
}

const scheduleRecord = {
  scheduleId: 'schedule-001',
  name: 'publish:articles:art-001',
  jobName: 'publishContent',
  runAt: '2026-05-12T09:00:00.000Z',
  status: 'active',
  createdAt: '2026-04-20T06:00:00.000Z',
  lastModifiedAt: '2026-04-20T08:00:00.000Z',
  data: {
    action: 'publish',
    contentType: 'articles',
    contentId: 'art-001',
  },
}

const scheduledJobs = [
  scheduleRecord,
  {
    scheduleId: 'schedule-002',
    name: 'unpublish:publications:pub-001',
    jobName: 'unpublishContent',
    runAt: '2026-05-20T15:00:00.000Z',
    status: 'paused',
    createdAt: '2026-04-18T09:30:00.000Z',
    lastModifiedAt: '2026-04-19T10:45:00.000Z',
    data: {
      action: 'unpublish',
      contentType: 'publications',
      contentId: 'pub-001',
    },
  },
]

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

function stubScheduleList(items = [scheduleRecord]) {
  cy.intercept('GET', /\/api\/v\d+\/scheduler(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      data: items,
      total: items.length,
      page: 1,
      limit: items.length,
    },
  }).as('schedulerList')
}

function runResponsiveAudit(pathname, title, screenshotKey, desktopAssertion, mobileAssertion) {
  cy.viewport(1440, 960)
  visitWithSession(pathname)
  cy.wait('@profile')
  cy.wait('@schedulerList')
  cy.contains(title).should('be.visible')
  cy.get('.page-header-actions').children().should('have.length', 2)
  desktopAssertion()
  assertViewportFitsDocument()
  assertNoHorizontalOverflow('.page-wrapper')
  cy.screenshot(`${screenshotKey}-desktop`, { capture: 'viewport' })

  cy.viewport(390, 844)
  visitWithSession(pathname)
  cy.wait('@profile')
  cy.wait('@schedulerList')
  cy.contains(title).should('be.visible')
  cy.get('.page-header-actions').children().should('have.length', 2)
  mobileAssertion()
  assertViewportFitsDocument()
  assertNoHorizontalOverflow('.page-wrapper')
  cy.screenshot(`${screenshotKey}-mobile`, { capture: 'viewport' })
}

describe('Scheduling workspace visual audit', () => {
  it('keeps the article schedule workspace responsive', () => {
    stubCommonData()
    stubScheduleList([
      {
        ...scheduleRecord,
        name: 'publish:articles:art-001',
        data: { action: 'publish', contentType: 'articles', contentId: 'art-001' },
      },
    ])
    cy.intercept('GET', /\/api\/v\d+\/articles\/art-001(?:\?.*)?$/, {
      statusCode: 200,
      body: { article },
    }).as('articleDetail')

    runResponsiveAudit(
      '/articles/art-001/schedule',
      'Schedule Article',
      'visual-article-schedule',
      () => {
        cy.wait('@articleDetail')
        cy.get('.schedule-jobs-table__desktop .el-table').should('exist')
      },
      () => {
        cy.wait('@articleDetail')
        cy.get('.schedule-jobs-mobile__card').should('have.length', 1)
      },
    )
  })

  it('keeps the event schedule workspace responsive', () => {
    stubCommonData()
    stubScheduleList([
      {
        ...scheduleRecord,
        name: 'publish:events:evt-001',
        data: { action: 'publish', contentType: 'events', contentId: 'evt-001' },
      },
    ])
    cy.intercept('GET', /\/api\/v\d+\/events\/evt-001(?:\?.*)?$/, {
      statusCode: 200,
      body: { event },
    }).as('eventDetail')

    runResponsiveAudit(
      '/events/evt-001/schedule',
      'Schedule Event',
      'visual-event-schedule',
      () => {
        cy.wait('@eventDetail')
        cy.get('.schedule-jobs-table__desktop .el-table').should('exist')
      },
      () => {
        cy.wait('@eventDetail')
        cy.get('.schedule-jobs-mobile__card').should('have.length', 1)
      },
    )
  })

  it('keeps the publication schedule workspace responsive', () => {
    stubCommonData()
    stubScheduleList([
      {
        ...scheduleRecord,
        name: 'publish:publications:pub-001',
        data: { action: 'publish', contentType: 'publications', contentId: 'pub-001' },
      },
    ])
    cy.intercept('GET', /\/api\/v\d+\/publications\/pub-001(?:\?.*)?$/, {
      statusCode: 200,
      body: { publication },
    }).as('publicationDetail')
    cy.intercept('GET', /\/api\/v\d+\/publications\/categories\/cat-001(?:\?.*)?$/, {
      statusCode: 200,
      body: { category },
    }).as('categoryDetail')

    runResponsiveAudit(
      '/publications/pub-001/schedule',
      'Schedule Publication',
      'visual-publication-schedule',
      () => {
        cy.wait('@publicationDetail')
        cy.wait('@categoryDetail')
        cy.get('.schedule-jobs-table__desktop .el-table').should('exist')
      },
      () => {
        cy.wait('@publicationDetail')
        cy.wait('@categoryDetail')
        cy.get('.schedule-jobs-mobile__card').should('have.length', 1)
      },
    )
  })

  it('keeps the publication category schedule workspace responsive', () => {
    stubCommonData()
    stubScheduleList([
      {
        ...scheduleRecord,
        name: 'publish:publicationCategories:cat-001',
        data: {
          action: 'publish',
          contentType: 'publicationCategories',
          contentId: 'cat-001',
        },
      },
    ])
    cy.intercept('GET', /\/api\/v\d+\/publications\/categories\/cat-001(?:\?.*)?$/, {
      statusCode: 200,
      body: { category },
    }).as('categoryDetail')

    runResponsiveAudit(
      '/publications/categories/cat-001/schedule',
      'Schedule Category',
      'visual-category-schedule',
      () => {
        cy.wait('@categoryDetail')
        cy.get('.schedule-jobs-table__desktop .el-table').should('exist')
      },
      () => {
        cy.wait('@categoryDetail')
        cy.get('.schedule-jobs-mobile__card').should('have.length', 1)
      },
    )
  })

  it('keeps the media upload workspace responsive', () => {
    stubCommonData()

    cy.viewport(1440, 960)
    visitWithSession('/photos/upload')
    cy.wait('@profile')
    cy.contains('Upload Photos').should('be.visible')
    cy.get('.page-header-actions').children().should('have.length', 2)
    cy.get('.media-upload-shell .workspace-panel').should('have.length', 2)
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    cy.screenshot('visual-media-upload-desktop', { capture: 'viewport' })

    cy.viewport(390, 844)
    visitWithSession('/photos/upload')
    cy.wait('@profile')
    cy.contains('Upload Photos').should('be.visible')
    cy.get('.page-header-actions').children().should('have.length', 2)
    cy.get('.media-upload-shell .workspace-panel').should('have.length', 2)
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    cy.screenshot('visual-media-upload-mobile', { capture: 'viewport' })
  })

  it('keeps the scheduled jobs workspace responsive', () => {
    stubCommonData()
    stubScheduleList(scheduledJobs)
    cy.intercept('GET', /\/api\/v\d+\/publications(?:\?.*)?$/, {
      statusCode: 200,
      body: {
        publications: [publication],
        items: [publication],
        page: 1,
        limit: 200,
        total: 1,
        totalPages: 1,
      },
    }).as('publicationsList')

    cy.viewport(1440, 960)
    visitWithSession('/system/scheduled-jobs')
    cy.wait('@profile')
    cy.wait('@schedulerList')
    cy.wait('@publicationsList')
    cy.contains('Scheduled Jobs').should('be.visible')
    cy.get('.page-header-actions').children().should('have.length', 2)
    cy.get('.schedule-jobs-table__desktop .el-table').should('exist')
    cy.get('.schedule-pagination').should('contain.text', 'Page 1 / 1')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    cy.screenshot('visual-scheduled-jobs-desktop', { capture: 'viewport' })

    cy.viewport(390, 844)
    visitWithSession('/system/scheduled-jobs')
    cy.wait('@profile')
    cy.wait('@schedulerList')
    cy.wait('@publicationsList')
    cy.contains('Scheduled Jobs').should('be.visible')
    cy.get('.page-header-actions').children().should('have.length', 2)
    cy.get('.schedule-jobs-mobile__card').its('length').should('be.gte', 1)
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.page-wrapper')
    cy.screenshot('visual-scheduled-jobs-mobile', { capture: 'viewport' })
  })
})
