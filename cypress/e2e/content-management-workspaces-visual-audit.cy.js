const session = {
  accessToken: 'content-management-visual-token',
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

const locales = [
  {
    localeId: 'locale-sw',
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    direction: 'ltr',
    isDefault: true,
    isActive: true,
    publicationStatus: 'published',
    effectiveStatus: 'published',
    updatedAt: '2026-04-18T08:30:00.000Z',
  },
  {
    localeId: 'locale-en',
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
    isDefault: false,
    isActive: true,
    publicationStatus: 'approved',
    effectiveStatus: 'approved',
    updatedAt: '2026-04-16T08:30:00.000Z',
  },
]

const layouts = [
  {
    layoutId: 'layout-main',
    name: 'Main Content Layout',
    description: 'Standard structure for informational pages.',
    regions: [
      { key: 'hero', label: 'Hero', order: 1 },
      { key: 'main', label: 'Main', order: 2 },
    ],
    isActive: true,
    publicationStatus: 'published',
    effectiveStatus: 'published',
  },
  {
    layoutId: 'layout-landing',
    name: 'Landing Layout',
    description: 'Marketing-style structure for broad overview pages.',
    regions: [{ key: 'hero', label: 'Hero', order: 1 }],
    isActive: true,
    publicationStatus: 'approved',
    effectiveStatus: 'approved',
  },
]

const blockTypes = [
  {
    blockTypeId: 'block-hero',
    key: 'hero',
    label: 'Hero Banner',
    description: 'Hero block with image, eyebrow, and call to action.',
    schema: { fields: [{ key: 'title' }, { key: 'summary' }, { key: 'cta' }] },
    allowedMedia: ['image'],
    isReusable: true,
    isActive: true,
    publicationStatus: 'published',
    effectiveStatus: 'published',
  },
  {
    blockTypeId: 'block-callout',
    key: 'callout',
    label: 'Callout',
    description: 'Short featured callout content.',
    schema: { fields: [{ key: 'title' }, { key: 'body' }] },
    allowedMedia: ['image', 'video'],
    isReusable: false,
    isActive: true,
    publicationStatus: 'approved',
    effectiveStatus: 'approved',
  },
]

const pages = [
  {
    pageId: 'page-home',
    name: 'Homepage',
    slug: '/',
    layoutId: 'layout-main',
    visibility: 'public',
    isHomePage: true,
    meta: {
      title: { en: 'FCC Homepage', sw: 'Ukurasa wa Mwanzo wa FCC' },
      description: {
        en: 'Homepage summary for the official FCC website.',
        sw: 'Muhtasari wa ukurasa wa mwanzo wa tovuti rasmi ya FCC.',
      },
      heroEyebrow: 'Official',
      heroSummary: 'Primary overview of the commission website experience.',
    },
    publicationStatus: 'published',
    effectiveStatus: 'published',
    updatedAt: '2026-04-19T07:45:00.000Z',
  },
  {
    pageId: 'page-about',
    name: 'About FCC',
    slug: '/about',
    layoutId: 'layout-main',
    visibility: 'public',
    isHomePage: false,
    meta: {
      title: { en: 'About FCC', sw: 'Kuhusu FCC' },
      description: {
        en: 'Institutional background and mandate.',
        sw: 'Historia ya taasisi na mamlaka yake.',
      },
    },
    publicationStatus: 'submitted',
    effectiveStatus: 'submitted',
    updatedAt: '2026-04-17T07:45:00.000Z',
  },
]

const contentItems = [
  {
    contentItemId: 'content-home-hero',
    key: 'homepage.hero.primary',
    type: 'hero',
    slug: '/homepage/hero',
    visibility: 'public',
    tags: ['homepage', 'hero'],
    metadata: {
      title: { en: 'Welcome to FCC', sw: 'Karibu FCC' },
      summary: {
        en: 'Primary homepage hero summary.',
        sw: 'Muhtasari mkuu wa hero ya ukurasa wa mwanzo.',
      },
      cta: { label: 'Read more', href: '/about' },
      note: 'Used on the homepage hero region.',
    },
    publicationStatus: 'published',
    effectiveStatus: 'published',
    updatedAt: '2026-04-18T10:00:00.000Z',
  },
  {
    contentItemId: 'content-about-callout',
    key: 'about.callout.mandate',
    type: 'callout',
    slug: '/about/mandate',
    visibility: 'public',
    tags: ['about', 'mandate'],
    metadata: {
      title: { en: 'Our Mandate', sw: 'Mamlaka Yetu' },
      summary: {
        en: 'Callout content for the about page.',
        sw: 'Maudhui ya mwito kwa ukurasa wa kuhusu.',
      },
      note: 'Used in the about page main region.',
    },
    publicationStatus: 'approved',
    effectiveStatus: 'approved',
    updatedAt: '2026-04-16T10:00:00.000Z',
  },
]

const contentVersions = [
  {
    contentVersionId: 'version-home-hero-en',
    contentItemId: 'content-home-hero',
    locale: 'en',
    versionNumber: 3,
    translationStatus: 'reviewed',
    title: { en: 'Welcome to FCC', sw: 'Karibu FCC' },
    blocks: [{ key: 'hero' }],
    media: { coverImage: null, gallery: [] },
    style: {},
    actions: [{ label: 'Read more', href: '/about' }],
    metadata: {},
    publicationStatus: 'published',
    effectiveStatus: 'published',
  },
  {
    contentVersionId: 'version-home-hero-sw',
    contentItemId: 'content-home-hero',
    locale: 'sw',
    versionNumber: 2,
    translationStatus: 'completed',
    title: { en: 'Welcome to FCC', sw: 'Karibu FCC' },
    blocks: [{ key: 'hero' }],
    media: { coverImage: null, gallery: [] },
    style: {},
    actions: [{ label: 'Soma zaidi', href: '/about' }],
    metadata: {},
    publicationStatus: 'approved',
    effectiveStatus: 'approved',
  },
]

const placements = [
  {
    placementId: 'placement-home-hero',
    pageId: 'page-home',
    contentItemId: 'content-home-hero',
    regionKey: 'hero',
    order: 1,
    isActive: true,
    startAt: '2026-04-01T08:00:00.000Z',
    endAt: '',
    publicationStatus: 'published',
    effectiveStatus: 'published',
  },
  {
    placementId: 'placement-about-callout',
    pageId: 'page-about',
    contentItemId: 'content-about-callout',
    regionKey: 'main',
    order: 2,
    isActive: true,
    startAt: '',
    endAt: '',
    publicationStatus: 'approved',
    effectiveStatus: 'approved',
  },
]

function paginated(key, items, limit = 20) {
  return {
    [key]: items,
    items,
    page: 1,
    limit,
    total: items.length,
    totalPages: 1,
  }
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

function assertButtonsStayInline(selector) {
  cy.get(selector)
    .then(($containers) => {
      expect($containers.length, `${selector} should render at least one action row`).to.be.gte(1)
    })

  cy.get(selector)
    .each(($container) => {
      cy.wrap($container).scrollIntoView({ block: 'center' })
      cy.wrap($container).should('be.visible')
      cy.wrap($container)
        .find('.el-button')
        .then(($buttons) => {
          expect($buttons.length, `${selector} should render multiple buttons`).to.be.gte(2)

          const topPositions = [...$buttons].map((button) =>
            Math.round(button.getBoundingClientRect().top),
          )
          const firstTop = topPositions[0]

          topPositions.forEach((top) => {
            expect(
              Math.abs(top - firstTop),
              `${selector} buttons should stay on one row`,
            ).to.be.at.most(1)
          })
        })
    })
}

function stubCommonData() {
  cy.intercept('GET', /\/api\/v\d+\/users\/profile\/[^/?]+(?:\?.*)?$/, {
    statusCode: 200,
    body: { profile: adminProfile },
  }).as('profile')
}

function stubContentManagementData() {
  cy.intercept('GET', /\/api\/v\d+\/locales(?:\?.*)?$/, {
    statusCode: 200,
    body: paginated('locales', locales),
  }).as('locales')

  cy.intercept('GET', /\/api\/v\d+\/locales\/active(?:\?.*)?$/, {
    statusCode: 200,
    body: { locales: locales.filter((item) => item.isActive) },
  }).as('activeLocales')

  cy.intercept('GET', /\/api\/v\d+\/content-management\/block-types(?:\?.*)?$/, {
    statusCode: 200,
    body: paginated('blockTypes', blockTypes),
  }).as('blockTypes')

  cy.intercept('GET', /\/api\/v\d+\/content-management\/layouts(?:\?.*)?$/, {
    statusCode: 200,
    body: paginated('layouts', layouts, 200),
  }).as('layouts')

  cy.intercept('GET', /\/api\/v\d+\/content-management\/pages(?:\?.*)?$/, {
    statusCode: 200,
    body: paginated('pages', pages),
  }).as('cmsPages')

  cy.intercept('GET', /\/api\/v\d+\/content-management\/content-items(?:\?.*)?$/, {
    statusCode: 200,
    body: paginated('contentItems', contentItems, 200),
  }).as('contentItems')

  cy.intercept('GET', /\/api\/v\d+\/content-management\/content-versions(?:\?.*)?$/, (req) => {
    const contentItemId = req.query?.contentItemId
    const locale = req.query?.locale

    let filtered = [...contentVersions]

    if (contentItemId) {
      filtered = filtered.filter((item) => item.contentItemId === contentItemId)
    }

    if (locale) {
      filtered = filtered.filter((item) => item.locale === locale)
    }

    req.reply({
      statusCode: 200,
      body: paginated('contentVersions', filtered, 200),
    })
  }).as('contentVersions')

  cy.intercept('GET', /\/api\/v\d+\/content-management\/placements(?:\?.*)?$/, {
    statusCode: 200,
    body: paginated('placements', placements),
  }).as('placements')
}

function auditWorkspace({ pathname, waits, screenshotBase, actionSelector = '.page-header-actions' }) {
  cy.viewport(1440, 960)
  visitWithSession(pathname)
  waits.forEach((alias) => cy.wait(alias))
  cy.location('pathname').should('eq', pathname)
  assertViewportFitsDocument()
  assertNoHorizontalOverflow('.page-wrapper')
  assertNoHorizontalOverflow('.workspace-shell')
  assertButtonsStayInline(actionSelector)
  assertButtonsStayInline('.workspace-form__actions')
  cy.screenshot(`${screenshotBase}-desktop`, { capture: 'viewport' })

  cy.viewport(390, 844)
  visitWithSession(pathname)
  waits.forEach((alias) => cy.wait(alias))
  cy.location('pathname').should('eq', pathname)
  assertViewportFitsDocument()
  assertNoHorizontalOverflow('.page-wrapper')
  assertNoHorizontalOverflow('.workspace-shell')
  assertButtonsStayInline(actionSelector)
  assertButtonsStayInline('.workspace-form__actions')
  cy.screenshot(`${screenshotBase}-mobile`, { capture: 'viewport' })
}

describe('Content management workspace visual audit', () => {
  beforeEach(() => {
    stubCommonData()
    stubContentManagementData()
  })

  it('keeps the locales workspace responsive', () => {
    auditWorkspace({
      pathname: '/content-management/locales',
      waits: ['@locales', '@activeLocales'],
      screenshotBase: 'visual-content-management-locales',
    })
  })

  it('keeps the block types workspace responsive', () => {
    auditWorkspace({
      pathname: '/content-management/block-types',
      waits: ['@blockTypes'],
      screenshotBase: 'visual-content-management-block-types',
    })
  })

  it('keeps the layouts workspace responsive', () => {
    auditWorkspace({
      pathname: '/content-management/layouts',
      waits: ['@layouts'],
      screenshotBase: 'visual-content-management-layouts',
    })
  })

  it('keeps the pages workspace responsive', () => {
    auditWorkspace({
      pathname: '/content-management/pages',
      waits: ['@cmsPages', '@layouts'],
      screenshotBase: 'visual-content-management-pages',
    })
  })

  it('keeps the content items workspace responsive', () => {
    auditWorkspace({
      pathname: '/content-management/content-items',
      waits: ['@contentItems'],
      screenshotBase: 'visual-content-management-content-items',
    })
  })

  it('keeps the content versions workspace responsive', () => {
    auditWorkspace({
      pathname: '/content-management/content-versions',
      waits: ['@contentVersions', '@contentItems'],
      screenshotBase: 'visual-content-management-content-versions',
    })
  })

  it('keeps the placements workspace responsive', () => {
    auditWorkspace({
      pathname: '/content-management/placements',
      waits: ['@placements', '@cmsPages', '@contentItems'],
      screenshotBase: 'visual-content-management-placements',
    })
  })
})
