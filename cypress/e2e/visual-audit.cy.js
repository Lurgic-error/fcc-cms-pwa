const session = {
  accessToken: 'visual-audit-token',
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

const commission = {
  commissionId: 'commission-001',
  name: { en: 'Fair Competition Commission', sw: 'Tume ya Ushindani wa Haki' },
  introduction: {
    en: 'The commission promotes fair competition and protects consumers across Tanzania.',
    sw: 'Tume inakuza ushindani wa haki na kulinda walaji kote Tanzania.',
  },
  outro: {
    en: 'Work with the commission to build a more transparent market.',
    sw: 'Shirikiana na tume kujenga soko lenye uwazi zaidi.',
  },
  welcomeNote: {
    en: 'Welcome to the commission profile and services workspace.',
    sw: 'Karibu kwenye wasifu wa tume na eneo la huduma.',
  },
  history: {
    en: 'The commission was established to strengthen market fairness and accountability.',
    sw: 'Tume ilianzishwa kuimarisha haki ya soko na uwajibikaji.',
  },
  mandate: {
    description: {
      en: 'The mandate explains how the commission regulates and enforces market conduct.',
      sw: 'Mandate inaeleza namna tume inavyodhibiti na kusimamia mwenendo wa soko.',
    },
    mandates: [
      {
        en: 'Investigate anti-competitive conduct and market abuse.',
        sw: 'Kuchunguza vitendo vya ushindani usio wa haki na matumizi mabaya ya soko.',
      },
      {
        en: 'Promote consumer welfare through fair-trading enforcement.',
        sw: 'Kukuza ustawi wa walaji kupitia usimamizi wa biashara ya haki.',
      },
    ],
  },
  slogan: {
    en: 'Fair markets. Confident consumers.',
    sw: 'Masoko ya haki. Walaji wenye imani.',
  },
  cta: {
    en: 'Report unfair market conduct and request regulatory guidance.',
    sw: 'Ripoti vitendo vya soko visivyo vya haki na omba mwongozo wa udhibiti.',
  },
  commissionerStatement: {
    en: 'The commission remains committed to transparent and responsive regulation.',
    sw: 'Tume inaendelea kujitolea kwa udhibiti wenye uwazi na mwitikio.',
  },
  dgStatement: {
    en: 'We are strengthening institutional delivery through coordinated action.',
    sw: 'Tunaimarisha utoaji wa huduma za taasisi kupitia hatua zilizo ratibiwa.',
  },
  coverImage: {
    fileId: 'cover-image-001',
    name: 'ushindani-house.png',
    url: '/src/assets/ushindani-house.png',
  },
  images: [
    {
      fileId: 'gallery-image-001',
      name: 'ushindani-house.png',
      url: '/src/assets/ushindani-house.png',
    },
    {
      fileId: 'gallery-image-002',
      name: 'ushindani-house.png',
      url: '/src/assets/ushindani-house.png',
    },
  ],
  organizationStructure: {
    title: { en: 'Organization Structure', sw: 'Muundo wa Taasisi' },
    description: {
      en: 'A view of directorates and reporting lines across the commission.',
      sw: 'Muonekano wa idara na mistari ya uwajibikaji ndani ya tume.',
    },
    imageAlt: {
      en: 'Commission organization chart',
      sw: 'Chati ya muundo wa tume',
    },
    image: {
      fileId: 'org-structure-001',
      name: 'ushindani-house.png',
      url: '/src/assets/ushindani-house.png',
    },
  },
  commissionFunctions: [
    {
      en: 'Review mergers and acquisitions for market fairness.',
      sw: 'Kukagua miungano na ununuzi kwa haki ya soko.',
    },
    {
      en: 'Provide public guidance on competition and consumer protection matters.',
      sw: 'Kutoa mwongozo wa umma kuhusu ushindani na ulinzi wa walaji.',
    },
  ],
  directorGeneral: {
    prefix: 'Dr.',
    firstName: 'Asha',
    middleName: 'M.',
    surname: 'Mtema',
    email: 'director.general@fcc.go.tz',
    phoneNumber: '+255700000001',
    profilePicture: {
      fileId: 'dg-image-001',
      name: 'ushindani-house.png',
      url: '/src/assets/ushindani-house.png',
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
  coreFunctions: [
    {
      coreFunctionId: 'core-function-001',
      name: { en: 'Enforcement', sw: 'Usimamizi' },
      description: {
        en: 'Investigate and resolve anti-competitive conduct across sectors.',
        sw: 'Kuchunguza na kutatua vitendo vya ushindani usio wa haki katika sekta mbalimbali.',
      },
      coverImage: {
        fileId: 'core-function-image-001',
        name: 'ushindani-house.png',
        url: '/src/assets/ushindani-house.png',
      },
    },
    {
      coreFunctionId: 'core-function-002',
      name: { en: 'Consumer Protection', sw: 'Ulinzi wa Walaji' },
      description: {
        en: 'Promote fair trading and provide consumer recourse pathways.',
        sw: 'Kukuza biashara ya haki na kutoa njia za malalamiko ya walaji.',
      },
      coverImage: {
        fileId: 'core-function-image-002',
        name: 'ushindani-house.png',
        url: '/src/assets/ushindani-house.png',
      },
    },
  ],
  philosophies: [
    {
      philosophyId: 'philosophy-001',
      title: { en: 'Transparency', sw: 'Uwazi' },
      description: {
        en: 'We communicate regulatory decisions clearly and consistently.',
        sw: 'Tunawasilisha maamuzi ya udhibiti kwa uwazi na uthabiti.',
      },
    },
    {
      philosophyId: 'philosophy-002',
      title: { en: 'Service', sw: 'Huduma' },
      description: {
        en: 'We design public-facing services around usability and accountability.',
        sw: 'Tunabuni huduma za umma kwa kuzingatia urahisi na uwajibikaji.',
      },
    },
  ],
}

Cypress.on('uncaught:exception', (err) => {
  if (String(err?.message || '').includes('ResizeObserver loop completed with undelivered notifications')) {
    return false
  }

  return true
})

function stubCmsShell() {
  cy.intercept('GET', '**/users/profile/**', {
    statusCode: 200,
    body: { profile: adminProfile },
  }).as('profile')

  cy.intercept('GET', '**/commission', {
    statusCode: 200,
    body: { commission },
  }).as('commission')

  cy.intercept('PUT', '**/commission', {
    statusCode: 200,
    body: { commission },
  }).as('saveCommission')
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

describe('Visual audit screenshots', () => {
  it('captures the login page at mobile and desktop viewports', () => {
    cy.viewport(390, 844)
    cy.visit('/auth/login?redirect=/dashboard')
    cy.get('form.auth-form').should('be.visible')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.auth-main')
    cy.get('.auth-main').screenshot('visual-login-mobile')

    cy.viewport(1440, 960)
    cy.visit('/auth/login?redirect=/dashboard')
    cy.get('form.auth-form').should('be.visible')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.auth-main')
    cy.get('.auth-main').screenshot('visual-login-desktop')
  })

  it('captures the commission wizard workspace at desktop and mobile viewports', () => {
    stubCmsShell()

    cy.viewport(1440, 960)
    visitWithSession('/commission/edit')
    cy.wait('@profile')
    cy.wait('@commission')
    cy.contains('Step 1 of 12').should('be.visible')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.wizard-shell')
    assertNoHorizontalOverflow('.wizard-shell__content-scroll')
    assertNoHorizontalOverflow('.wizard-shell__footer')
    cy.get('.wizard-shell').screenshot('visual-commission-basic-desktop')

    cy.contains('button', 'Mandate').scrollIntoView().click({ force: true })
    cy.contains('Add Mandate Item').scrollIntoView().should('be.visible')
    assertNoHorizontalOverflow('.wizard-shell')
    assertNoHorizontalOverflow('.wizard-shell__content-scroll')
    assertNoHorizontalOverflow('.wizard-shell__footer')
    cy.get('.wizard-shell').screenshot('visual-commission-mandate-desktop')

    cy.contains('button', 'Core Functions').scrollIntoView().click({ force: true })
    cy.contains('Add Core Function').scrollIntoView().should('be.visible')
    assertNoHorizontalOverflow('.wizard-shell')
    assertNoHorizontalOverflow('.wizard-shell__content-scroll')
    assertNoHorizontalOverflow('.wizard-shell__footer')
    cy.get('.wizard-shell').screenshot('visual-commission-core-functions-desktop')

    cy.viewport(390, 844)
    visitWithSession('/commission/edit')
    cy.wait('@profile')
    cy.wait('@commission')
    cy.contains('Step 1 of 12').should('be.visible')
    assertViewportFitsDocument()
    assertNoHorizontalOverflow('.wizard-shell')
    assertNoHorizontalOverflow('.wizard-shell__content-scroll')
    assertNoHorizontalOverflow('.wizard-shell__footer')
    cy.get('.wizard-shell').screenshot('visual-commission-basic-mobile')

    cy.contains('button', 'Mandate').scrollIntoView().click({ force: true })
    cy.contains('Add Mandate Item').scrollIntoView().should('be.visible')
    assertNoHorizontalOverflow('.wizard-shell')
    assertNoHorizontalOverflow('.wizard-shell__content-scroll')
    assertNoHorizontalOverflow('.wizard-shell__footer')
    cy.get('.wizard-shell').screenshot('visual-commission-mandate-mobile')
  })
})
