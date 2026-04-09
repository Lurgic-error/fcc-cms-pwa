const cmsSession = Object.freeze({
  accessToken: 'test-access-token',
  userId: 'user-001',
  role: 'admin',
  roles: ['admin'],
  permissions: ['create', 'update', 'delete', 'review', 'publish', 'archive'],
  profile: {
    userId: 'user-001',
    roles: [{ name: 'admin' }],
    permissions: [
      { name: 'create' },
      { name: 'update' },
      { name: 'delete' },
      { name: 'review' },
      { name: 'publish' },
      { name: 'archive' },
    ],
  },
})

const publicationId = 'pub-001'
const categoryId = 'cat-001'
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
const publishScheduleLocal = '2026-03-20T10:30'
const publishScheduleIso = new Date(publishScheduleLocal).toISOString()
const unpublishScheduleLocal = '2026-03-21T10:30'
const unpublishScheduleIso = new Date(unpublishScheduleLocal).toISOString()

function buildPublicationRecord(status, overrides = {}) {
  const isArchived = status === 'archived'
  const isDeleted = status === 'deleted'
  const publicationStatus = overrides.publicationStatus || (isArchived || isDeleted ? 'draft' : status)

  return {
    publicationId,
    _id: 'mongo-publication-001',
    name: { en: 'Annual Market Report' },
    description: { en: 'Annual market report', sw: 'Ripoti ya soko' },
    category: {
      categoryId,
      _id: 'mongo-category-001',
      name: { en: 'Reports' },
      publicationStatus: 'published',
    },
    publicationStatus,
    isArchived,
    archived: isArchived,
    isDeleted,
    deleted: isDeleted,
    issueDate: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-18T08:00:00.000Z',
    ...overrides,
  }
}

function buildCategoryRecord(status, overrides = {}) {
  const isArchived = status === 'archived'
  const isDeleted = status === 'deleted'
  const publicationStatus = overrides.publicationStatus || (isArchived || isDeleted ? 'draft' : status)

  return {
    categoryId,
    _id: 'mongo-category-001',
    systemKey: 'reports',
    name: { en: 'Reports', sw: 'Ripoti' },
    description: { en: 'Reports', sw: 'Ripoti' },
    publicationStatus,
    isArchived,
    archived: isArchived,
    isDeleted,
    deleted: isDeleted,
    publicationCount: 0,
    publishedPublicationCount: 0,
    updatedAt: '2026-03-18T08:00:00.000Z',
    ...overrides,
  }
}

function openAction(label) {
  cy.contains('button', 'Actions').click()
  cy.contains('.el-dropdown-menu__item', label).click({ force: true })
}

function getVisibleMessageBox() {
  return cy.get('.el-overlay-message-box:visible .el-message-box').last()
}

function confirmDialog({ reason, dateTime } = {}) {
  getVisibleMessageBox().should('be.visible')

  if (reason) {
    getVisibleMessageBox()
      .find('textarea, .el-textarea__inner')
      .filter(':visible')
      .first()
      .clear()
      .type(reason)
  }

  if (dateTime) {
    getVisibleMessageBox()
      .find('input[type="datetime-local"], .el-message-box__input input')
      .filter(':visible')
      .first()
      .clear()
      .type(dateTime)
  }

  getVisibleMessageBox().find('.el-message-box__btns .el-button--primary').click()
}

function expectFollowUpAction(label) {
  cy.contains('button', 'Actions').click()
  cy.contains('.el-dropdown-menu__item', label).should('be.visible')
  cy.get('body').type('{esc}')
}

function mountPublicationDetail(initialRecord, route = `/publications/${publicationId}`) {
  let publicationRecord = { ...initialRecord }
  const categoryRecord = buildCategoryRecord('published', { publishedPublicationCount: 1 })

  cy.intercept('GET', `**/api/v1/publications/${publicationId}`, (req) => {
    req.reply({
      body: { publication: publicationRecord },
    })
  }).as('loadPublication')

  cy.intercept('GET', `**/api/v1/publications/categories/${categoryId}`, (req) => {
    req.reply({
      body: { category: categoryRecord },
    })
  }).as('loadCategory')

  cy.visitWithCmsSession(route, cmsSession)
  cy.wait('@loadPublication')
  cy.wait('@loadCategory')

  return {
    update(nextRecord) {
      publicationRecord = { ...nextRecord }
    },
  }
}

function mountCategoryDetail(initialRecord) {
  let categoryRecord = { ...initialRecord }

  cy.intercept('GET', `**/api/v1/publications/categories/${categoryId}`, (req) => {
    req.reply({
      body: { category: categoryRecord },
    })
  }).as('loadCategory')

  cy.intercept('GET', '**/api/v1/publications*', (req) => {
    if (req.query?.categoryId === categoryId) {
      req.reply({
        body: {
          publications: [],
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        },
      })
      return
    }

    req.continue()
  }).as('loadLinkedPublications')

  cy.visitWithCmsSession(`/publications/categories/${categoryId}`, cmsSession)
  cy.wait('@loadCategory')
  cy.wait('@loadLinkedPublications')

  return {
    update(nextRecord) {
      categoryRecord = { ...nextRecord }
    },
  }
}

const publicationCases = [
  {
    name: 'submits a publication for approval',
    label: 'Submit for Approval',
    initialRecord: buildPublicationRecord('draft'),
    method: 'PUT',
    path: `**/api/v1/publications/${publicationId}/submit`,
    nextRecord: buildPublicationRecord('submitted'),
    afterLabel: 'Approve',
  },
  {
    name: 'approves a submitted publication',
    label: 'Approve',
    initialRecord: buildPublicationRecord('submitted'),
    method: 'PUT',
    path: `**/api/v1/publications/${publicationId}/approve`,
    nextRecord: buildPublicationRecord('approved'),
    afterLabel: 'Publish',
  },
  {
    name: 'rejects a submitted publication',
    label: 'Reject',
    initialRecord: buildPublicationRecord('submitted'),
    method: 'PUT',
    path: `**/api/v1/publications/${publicationId}/reject`,
    nextRecord: buildPublicationRecord('rejected'),
    dialog: { reason: 'Needs legal review' },
    assertBody(body) {
      expect(body).to.deep.equal({ reason: 'Needs legal review' })
    },
    afterLabel: 'Submit for Approval',
  },
  {
    name: 'publishes an approved publication',
    label: 'Publish',
    initialRecord: buildPublicationRecord('approved'),
    method: 'PUT',
    path: `**/api/v1/publications/${publicationId}/publish`,
    nextRecord: buildPublicationRecord('published'),
    confirm: true,
    afterLabel: 'Unpublish',
  },
  {
    name: 'unpublishes a published publication',
    label: 'Unpublish',
    initialRecord: buildPublicationRecord('published'),
    method: 'PUT',
    path: `**/api/v1/publications/${publicationId}/unpublish`,
    nextRecord: buildPublicationRecord('unpublished'),
    confirm: true,
    afterLabel: 'Schedule Publish',
  },
  {
    name: 'schedules publication publishing',
    label: 'Schedule Publish',
    initialRecord: buildPublicationRecord('approved'),
    method: 'PUT',
    path: `**/api/v1/publications/${publicationId}/schedule-publish`,
    nextRecord: buildPublicationRecord('approved', {
      scheduledPublishAt: publishScheduleIso,
      publishScheduleCanceled: false,
    }),
    dialog: { dateTime: publishScheduleLocal },
    assertBody(body) {
      expect(body).to.deep.equal({
        scheduledPublishAt: publishScheduleIso,
        timezone,
      })
    },
    afterLabel: 'Cancel Publish Schedule',
  },
  {
    name: 'schedules publication unpublishing',
    label: 'Schedule Unpublish',
    initialRecord: buildPublicationRecord('published'),
    method: 'PUT',
    path: `**/api/v1/publications/${publicationId}/schedule-unpublish`,
    nextRecord: buildPublicationRecord('published', {
      scheduledUnpublishAt: unpublishScheduleIso,
      unpublishScheduleCanceled: false,
    }),
    dialog: { dateTime: unpublishScheduleLocal },
    assertBody(body) {
      expect(body).to.deep.equal({
        scheduledUnpublishAt: unpublishScheduleIso,
        timezone,
      })
    },
    afterLabel: 'Cancel Unpublish Schedule',
  },
  {
    name: 'archives a publication',
    label: 'Archive',
    initialRecord: buildPublicationRecord('unpublished'),
    method: 'PUT',
    path: `**/api/v1/publications/${publicationId}/archive`,
    nextRecord: buildPublicationRecord('archived'),
    dialog: { reason: 'Move to archive' },
    assertBody(body) {
      expect(body).to.deep.equal({ reason: 'Move to archive' })
    },
    afterLabel: 'Restore from Archive',
  },
  {
    name: 'restores an archived publication',
    label: 'Restore from Archive',
    initialRecord: buildPublicationRecord('archived'),
    method: 'PUT',
    path: `**/api/v1/publications/${publicationId}/restore-archive`,
    nextRecord: buildPublicationRecord('unpublished'),
    confirm: true,
    afterLabel: 'Archive',
  },
  {
    name: 'soft deletes a publication',
    label: 'Soft Delete',
    initialRecord: buildPublicationRecord('draft'),
    method: 'PUT',
    path: `**/api/v1/publications/${publicationId}/soft-delete`,
    nextRecord: buildPublicationRecord('deleted'),
    dialog: { reason: 'Remove draft' },
    assertBody(body) {
      expect(body).to.deep.equal({ reason: 'Remove draft' })
    },
    afterLabel: 'Restore',
  },
  {
    name: 'restores a soft-deleted publication',
    label: 'Restore',
    initialRecord: buildPublicationRecord('deleted'),
    method: 'PUT',
    path: `**/api/v1/publications/${publicationId}/restore`,
    nextRecord: buildPublicationRecord('draft'),
    confirm: true,
    afterLabel: 'Submit for Approval',
  },
  {
    name: 'permanently deletes a soft-deleted publication',
    label: 'Delete Permanently',
    initialRecord: buildPublicationRecord('deleted'),
    method: 'DELETE',
    path: `**/api/v1/publications/${publicationId}/delete`,
    nextRecord: buildPublicationRecord('deleted'),
    confirm: true,
    expectRedirect: '/publications',
  },
]

const categoryCases = [
  {
    name: 'submits a publication category for approval',
    label: 'Submit for Approval',
    initialRecord: buildCategoryRecord('draft'),
    method: 'PUT',
    path: `**/api/v1/publications/categories/${categoryId}/submit`,
    nextRecord: buildCategoryRecord('submitted'),
    afterLabel: 'Approve',
  },
  {
    name: 'approves a submitted publication category',
    label: 'Approve',
    initialRecord: buildCategoryRecord('submitted'),
    method: 'PUT',
    path: `**/api/v1/publications/categories/${categoryId}/approve`,
    nextRecord: buildCategoryRecord('approved'),
    afterLabel: 'Publish',
  },
  {
    name: 'rejects a submitted publication category',
    label: 'Reject',
    initialRecord: buildCategoryRecord('submitted'),
    method: 'PUT',
    path: `**/api/v1/publications/categories/${categoryId}/reject`,
    nextRecord: buildCategoryRecord('rejected'),
    dialog: { reason: 'Needs restructuring' },
    assertBody(body) {
      expect(body).to.deep.equal({ reason: 'Needs restructuring' })
    },
    afterLabel: 'Submit for Approval',
  },
  {
    name: 'publishes an approved publication category',
    label: 'Publish',
    initialRecord: buildCategoryRecord('approved'),
    method: 'PUT',
    path: `**/api/v1/publications/categories/${categoryId}/publish`,
    nextRecord: buildCategoryRecord('published'),
    confirm: true,
    afterLabel: 'Unpublish',
  },
  {
    name: 'unpublishes a published publication category',
    label: 'Unpublish',
    initialRecord: buildCategoryRecord('published'),
    method: 'PUT',
    path: `**/api/v1/publications/categories/${categoryId}/unpublish`,
    nextRecord: buildCategoryRecord('unpublished'),
    confirm: true,
    afterLabel: 'Schedule Publish',
  },
  {
    name: 'schedules category publishing',
    label: 'Schedule Publish',
    initialRecord: buildCategoryRecord('approved'),
    method: 'PUT',
    path: `**/api/v1/publications/categories/${categoryId}/schedule-publish`,
    nextRecord: buildCategoryRecord('approved', {
      scheduledPublishAt: publishScheduleIso,
      publishScheduleCanceled: false,
    }),
    dialog: { dateTime: publishScheduleLocal },
    assertBody(body) {
      expect(body).to.deep.equal({
        scheduledPublishAt: publishScheduleIso,
        timezone,
      })
    },
    afterLabel: 'Cancel Publish Schedule',
  },
  {
    name: 'schedules category unpublishing',
    label: 'Schedule Unpublish',
    initialRecord: buildCategoryRecord('published'),
    method: 'PUT',
    path: `**/api/v1/publications/categories/${categoryId}/schedule-unpublish`,
    nextRecord: buildCategoryRecord('published', {
      scheduledUnpublishAt: unpublishScheduleIso,
      unpublishScheduleCanceled: false,
    }),
    dialog: { dateTime: unpublishScheduleLocal },
    assertBody(body) {
      expect(body).to.deep.equal({
        scheduledUnpublishAt: unpublishScheduleIso,
        timezone,
      })
    },
    afterLabel: 'Cancel Unpublish Schedule',
  },
  {
    name: 'archives a publication category',
    label: 'Archive',
    initialRecord: buildCategoryRecord('unpublished'),
    method: 'PUT',
    path: `**/api/v1/publications/categories/${categoryId}/archive`,
    nextRecord: buildCategoryRecord('archived'),
    dialog: { reason: 'Archive old category' },
    assertBody(body) {
      expect(body).to.deep.equal({ reason: 'Archive old category' })
    },
    afterLabel: 'Restore from Archive',
  },
  {
    name: 'restores an archived publication category',
    label: 'Restore from Archive',
    initialRecord: buildCategoryRecord('archived'),
    method: 'PUT',
    path: `**/api/v1/publications/categories/${categoryId}/restore-archive`,
    nextRecord: buildCategoryRecord('unpublished'),
    confirm: true,
    afterLabel: 'Archive',
  },
  {
    name: 'soft deletes a publication category',
    label: 'Soft Delete',
    initialRecord: buildCategoryRecord('draft'),
    method: 'PUT',
    path: `**/api/v1/publications/categories/${categoryId}/soft-delete`,
    nextRecord: buildCategoryRecord('deleted'),
    dialog: { reason: 'Remove unused category' },
    assertBody(body) {
      expect(body).to.deep.equal({ reason: 'Remove unused category' })
    },
    afterLabel: 'Restore',
  },
  {
    name: 'restores a soft-deleted publication category',
    label: 'Restore',
    initialRecord: buildCategoryRecord('deleted'),
    method: 'PUT',
    path: `**/api/v1/publications/categories/${categoryId}/restore`,
    nextRecord: buildCategoryRecord('draft'),
    confirm: true,
    afterLabel: 'Submit for Approval',
  },
  {
    name: 'permanently deletes a soft-deleted publication category',
    label: 'Delete Permanently',
    initialRecord: buildCategoryRecord('deleted'),
    method: 'DELETE',
    path: `**/api/v1/publications/categories/${categoryId}/delete`,
    nextRecord: buildCategoryRecord('deleted'),
    confirm: true,
    expectRedirect: '/publications/categories',
  },
]

describe('Publications lifecycle UI wiring', () => {
  beforeEach(() => {
    cy.resetSession()
  })

  publicationCases.forEach((testCase) => {
    it(testCase.name, () => {
      const detail = mountPublicationDetail(testCase.initialRecord)

      cy.intercept(testCase.method, testCase.path, (req) => {
        if (typeof testCase.assertBody === 'function') {
          testCase.assertBody(req.body || {})
        }

        detail.update(testCase.nextRecord)

        req.reply({
          body: { publication: testCase.nextRecord },
        })
      }).as('workflowAction')

      openAction(testCase.label)

      if (testCase.dialog) {
        confirmDialog(testCase.dialog)
      } else if (testCase.confirm) {
        confirmDialog()
      }

      cy.wait('@workflowAction')

      if (testCase.expectRedirect) {
        cy.location('pathname').should('eq', testCase.expectRedirect)
        return
      }

      cy.wait('@loadPublication')
      cy.wait('@loadCategory')
      expectFollowUpAction(testCase.afterLabel)
    })
  })
})

describe('Publication categories lifecycle UI wiring', () => {
  beforeEach(() => {
    cy.resetSession()
  })

  categoryCases.forEach((testCase) => {
    it(testCase.name, () => {
      const detail = mountCategoryDetail(testCase.initialRecord)

      cy.intercept(testCase.method, testCase.path, (req) => {
        if (typeof testCase.assertBody === 'function') {
          testCase.assertBody(req.body || {})
        }

        detail.update(testCase.nextRecord)

        req.reply({
          body: { category: testCase.nextRecord },
        })
      }).as('workflowAction')

      openAction(testCase.label)

      if (testCase.dialog) {
        confirmDialog(testCase.dialog)
      } else if (testCase.confirm) {
        confirmDialog()
      }

      cy.wait('@workflowAction')

      if (testCase.expectRedirect) {
        cy.location('pathname').should('eq', testCase.expectRedirect)
        return
      }

      cy.wait('@loadCategory')
      cy.wait('@loadLinkedPublications')
      expectFollowUpAction(testCase.afterLabel)
    })
  })
})
