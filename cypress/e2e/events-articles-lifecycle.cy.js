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

const eventId = 'evt-001'
const articleId = 'art-001'
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
const publishScheduleLocal = '2026-03-20T10:30'
const publishScheduleIso = new Date(publishScheduleLocal).toISOString()
const unpublishScheduleLocal = '2026-03-21T10:30'
const unpublishScheduleIso = new Date(unpublishScheduleLocal).toISOString()

function buildEventRecord(status, overrides = {}) {
  const isArchived = status === 'archived'
  const isDeleted = status === 'deleted'
  const publicationStatus = overrides.publicationStatus || (isArchived || isDeleted ? 'draft' : status)

  return {
    eventId,
    title: 'Competition Forum 2026',
    description: 'Annual competition forum',
    publicationStatus,
    isArchived,
    archived: isArchived,
    isDeleted,
    deleted: isDeleted,
    occurrences: [
      {
        startDate: '2026-03-25T09:00:00.000Z',
        endDate: '2026-03-25T17:00:00.000Z',
      },
    ],
    updatedAt: '2026-03-18T08:00:00.000Z',
    ...overrides,
  }
}

function buildArticleRecord(status, overrides = {}) {
  const isArchived = status === 'archived'
  const isDeleted = status === 'deleted'
  const publicationStatus = overrides.publicationStatus || (isArchived || isDeleted ? 'draft' : status)

  return {
    articleId,
    title: { en: 'Market Update', sw: 'Taarifa ya Soko' },
    description: { en: 'Market summary', sw: 'Muhtasari wa soko' },
    body: { en: 'Long-form article body', sw: 'Mwili wa makala' },
    slug: 'market-update',
    publicationStatus,
    isArchived,
    archived: isArchived,
    isDeleted,
    deleted: isDeleted,
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

function mountEventDetail(initialRecord) {
  let eventRecord = { ...initialRecord }

  cy.intercept('GET', new RegExp(`/api/v1/events/${eventId}(?:\\?.*)?$`), {
    body: eventRecord,
  }).as('loadEvent')

  cy.intercept('GET', /\/api\/v1\/events(?:\?.*)?$/, {
    body: {
      data: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    },
  }).as('loadEventList')

  cy.visitWithCmsSession(`/events/${eventId}`, cmsSession)
  cy.wait('@loadEvent')

  return {
    update(nextRecord) {
      eventRecord = { ...nextRecord }
    },
  }
}

function mountArticleDetail(initialRecord) {
  let articleRecord = { ...initialRecord }

  cy.intercept('GET', new RegExp(`/api/v1/articles/${articleId}(?:\\?.*)?$`), {
    body: articleRecord,
  }).as('loadArticle')

  cy.intercept('GET', /\/api\/v1\/articles(?:\?.*)?$/, {
    body: {
      data: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    },
  }).as('loadArticleList')

  cy.visitWithCmsSession(`/articles/${articleId}`, cmsSession)
  cy.wait('@loadArticle')

  return {
    update(nextRecord) {
      articleRecord = { ...nextRecord }
    },
  }
}

const eventCases = [
  {
    name: 'submits an event for approval',
    label: 'Submit for Approval',
    initialRecord: buildEventRecord('draft'),
    method: 'PUT',
    path: `**/api/v1/events/${eventId}/submit`,
    nextRecord: buildEventRecord('submitted'),
    afterLabel: 'Approve',
  },
  {
    name: 'approves a submitted event',
    label: 'Approve',
    initialRecord: buildEventRecord('submitted'),
    method: 'PUT',
    path: `**/api/v1/events/${eventId}/approve`,
    nextRecord: buildEventRecord('approved'),
    afterLabel: 'Publish',
  },
  {
    name: 'rejects a submitted event',
    label: 'Reject',
    initialRecord: buildEventRecord('submitted'),
    method: 'PUT',
    path: `**/api/v1/events/${eventId}/reject`,
    nextRecord: buildEventRecord('rejected'),
    dialog: { reason: 'Needs logistics updates' },
    assertBody(body) {
      expect(body).to.deep.equal({ reason: 'Needs logistics updates' })
    },
    afterLabel: 'Submit for Approval',
  },
  {
    name: 'publishes an approved event',
    label: 'Publish',
    initialRecord: buildEventRecord('approved'),
    method: 'PUT',
    path: `**/api/v1/events/${eventId}/publish`,
    nextRecord: buildEventRecord('published'),
    confirm: true,
    afterLabel: 'Unpublish',
  },
  {
    name: 'unpublishes a published event',
    label: 'Unpublish',
    initialRecord: buildEventRecord('published'),
    method: 'PUT',
    path: `**/api/v1/events/${eventId}/unpublish`,
    nextRecord: buildEventRecord('unpublished'),
    confirm: true,
    afterLabel: 'Schedule Publish',
  },
  {
    name: 'schedules event publishing',
    label: 'Schedule Publish',
    initialRecord: buildEventRecord('approved'),
    method: 'PUT',
    path: `**/api/v1/events/${eventId}/schedule-publish`,
    nextRecord: buildEventRecord('approved', {
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
    name: 'schedules event unpublishing',
    label: 'Schedule Unpublish',
    initialRecord: buildEventRecord('published'),
    method: 'PUT',
    path: `**/api/v1/events/${eventId}/schedule-unpublish`,
    nextRecord: buildEventRecord('published', {
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
    name: 'archives an event',
    label: 'Archive',
    initialRecord: buildEventRecord('approved'),
    method: 'PUT',
    path: `**/api/v1/events/${eventId}/archive`,
    nextRecord: buildEventRecord('archived', {
      isArchived: true,
      archived: true,
    }),
    dialog: { reason: 'Moved to archive' },
    assertBody(body) {
      expect(body).to.deep.equal({ reason: 'Moved to archive' })
    },
    afterLabel: 'Restore from Archive',
  },
  {
    name: 'restores an archived event',
    label: 'Restore from Archive',
    initialRecord: buildEventRecord('archived', {
      isArchived: true,
      archived: true,
      publicationStatus: 'approved',
    }),
    method: 'PUT',
    path: `**/api/v1/events/${eventId}/restore-archive`,
    nextRecord: buildEventRecord('approved'),
    confirm: true,
    afterLabel: 'Archive',
  },
  {
    name: 'soft deletes an event',
    label: 'Soft Delete',
    initialRecord: buildEventRecord('approved'),
    method: 'PUT',
    path: `**/api/v1/events/${eventId}/soft-delete`,
    nextRecord: buildEventRecord('deleted', {
      isDeleted: true,
      deleted: true,
    }),
    dialog: { reason: 'Removed temporarily' },
    assertBody(body) {
      expect(body).to.deep.equal({ reason: 'Removed temporarily' })
    },
    afterLabel: 'Restore',
  },
  {
    name: 'restores a soft-deleted event',
    label: 'Restore',
    initialRecord: buildEventRecord('deleted', {
      isDeleted: true,
      deleted: true,
      publicationStatus: 'draft',
    }),
    method: 'PUT',
    path: `**/api/v1/events/${eventId}/restore`,
    nextRecord: buildEventRecord('draft'),
    confirm: true,
    afterLabel: 'Submit for Approval',
  },
  {
    name: 'permanently deletes a soft-deleted event',
    label: 'Delete Permanently',
    initialRecord: buildEventRecord('deleted', {
      isDeleted: true,
      deleted: true,
      publicationStatus: 'draft',
    }),
    method: 'DELETE',
    path: `**/api/v1/events/${eventId}/delete`,
    confirm: true,
    afterPath: '/events',
  },
]

const articleCases = [
  {
    name: 'submits an article for approval',
    label: 'Submit for Approval',
    initialRecord: buildArticleRecord('draft'),
    method: 'PUT',
    path: `**/api/v1/articles/${articleId}/submit`,
    nextRecord: buildArticleRecord('submitted'),
    afterLabel: 'Approve',
  },
  {
    name: 'approves a submitted article',
    label: 'Approve',
    initialRecord: buildArticleRecord('submitted'),
    method: 'PUT',
    path: `**/api/v1/articles/${articleId}/approve`,
    nextRecord: buildArticleRecord('approved'),
    afterLabel: 'Publish',
  },
  {
    name: 'rejects a submitted article',
    label: 'Reject',
    initialRecord: buildArticleRecord('submitted'),
    method: 'PUT',
    path: `**/api/v1/articles/${articleId}/reject`,
    nextRecord: buildArticleRecord('rejected'),
    dialog: { reason: 'Needs editorial updates' },
    assertBody(body) {
      expect(body).to.deep.equal({ reason: 'Needs editorial updates' })
    },
    afterLabel: 'Submit for Approval',
  },
  {
    name: 'publishes an approved article',
    label: 'Publish',
    initialRecord: buildArticleRecord('approved'),
    method: 'PUT',
    path: `**/api/v1/articles/${articleId}/publish`,
    nextRecord: buildArticleRecord('published'),
    confirm: true,
    afterLabel: 'Unpublish',
  },
  {
    name: 'unpublishes a published article',
    label: 'Unpublish',
    initialRecord: buildArticleRecord('published'),
    method: 'PUT',
    path: `**/api/v1/articles/${articleId}/unpublish`,
    nextRecord: buildArticleRecord('unpublished'),
    confirm: true,
    afterLabel: 'Schedule Publish',
  },
  {
    name: 'schedules article publishing',
    label: 'Schedule Publish',
    initialRecord: buildArticleRecord('approved'),
    method: 'PUT',
    path: `**/api/v1/articles/${articleId}/schedule-publish`,
    nextRecord: buildArticleRecord('approved', {
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
    name: 'schedules article unpublishing',
    label: 'Schedule Unpublish',
    initialRecord: buildArticleRecord('published'),
    method: 'PUT',
    path: `**/api/v1/articles/${articleId}/schedule-unpublish`,
    nextRecord: buildArticleRecord('published', {
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
    name: 'archives an article',
    label: 'Archive',
    initialRecord: buildArticleRecord('approved'),
    method: 'PUT',
    path: `**/api/v1/articles/${articleId}/archive`,
    nextRecord: buildArticleRecord('archived', {
      isArchived: true,
      archived: true,
    }),
    dialog: { reason: 'Moved to archive' },
    assertBody(body) {
      expect(body).to.deep.equal({ reason: 'Moved to archive' })
    },
    afterLabel: 'Restore from Archive',
  },
  {
    name: 'restores an archived article',
    label: 'Restore from Archive',
    initialRecord: buildArticleRecord('archived', {
      isArchived: true,
      archived: true,
      publicationStatus: 'approved',
    }),
    method: 'PUT',
    path: `**/api/v1/articles/${articleId}/restore-archive`,
    nextRecord: buildArticleRecord('approved'),
    confirm: true,
    afterLabel: 'Archive',
  },
  {
    name: 'soft deletes an article',
    label: 'Soft Delete',
    initialRecord: buildArticleRecord('approved'),
    method: 'PUT',
    path: `**/api/v1/articles/${articleId}/soft-delete`,
    nextRecord: buildArticleRecord('deleted', {
      isDeleted: true,
      deleted: true,
    }),
    dialog: { reason: 'Removed temporarily' },
    assertBody(body) {
      expect(body).to.deep.equal({ reason: 'Removed temporarily' })
    },
    afterLabel: 'Restore',
  },
  {
    name: 'restores a soft-deleted article',
    label: 'Restore',
    initialRecord: buildArticleRecord('deleted', {
      isDeleted: true,
      deleted: true,
      publicationStatus: 'draft',
    }),
    method: 'PUT',
    path: `**/api/v1/articles/${articleId}/restore`,
    nextRecord: buildArticleRecord('draft'),
    confirm: true,
    afterLabel: 'Submit for Approval',
  },
  {
    name: 'permanently deletes a soft-deleted article',
    label: 'Delete Permanently',
    initialRecord: buildArticleRecord('deleted', {
      isDeleted: true,
      deleted: true,
      publicationStatus: 'draft',
    }),
    method: 'DELETE',
    path: `**/api/v1/articles/${articleId}/delete`,
    confirm: true,
    afterPath: '/articles',
  },
]

describe('Events lifecycle UI wiring', () => {
  eventCases.forEach((testCase) => {
    it(testCase.name, () => {
      const detail = mountEventDetail(testCase.initialRecord)

      cy.intercept(testCase.method, testCase.path, (req) => {
        if (typeof testCase.assertBody === 'function') {
          testCase.assertBody(req.body || {})
        }

        if (testCase.nextRecord) {
          detail.update(testCase.nextRecord)
        }

        req.reply({
          body: testCase.nextRecord
            ? {
                event: testCase.nextRecord,
                message: `${testCase.label} completed successfully.`,
              }
            : { ok: true },
        })
      }).as('workflowAction')

      openAction(testCase.label)

      if (testCase.dialog) {
        confirmDialog(testCase.dialog)
      } else if (testCase.confirm) {
        confirmDialog()
      }

      cy.wait('@workflowAction')

      if (testCase.afterPath) {
        cy.wait('@loadEventList')
        cy.location('pathname').should('eq', testCase.afterPath)
      } else {
        cy.wait('@loadEvent')
      }
    })
  })
})

describe('Articles lifecycle UI wiring', () => {
  articleCases.forEach((testCase) => {
    it(testCase.name, () => {
      const detail = mountArticleDetail(testCase.initialRecord)

      cy.intercept(testCase.method, testCase.path, (req) => {
        if (typeof testCase.assertBody === 'function') {
          testCase.assertBody(req.body || {})
        }

        if (testCase.nextRecord) {
          detail.update(testCase.nextRecord)
        }

        req.reply({
          body: testCase.nextRecord
            ? {
                article: testCase.nextRecord,
                message: `${testCase.label} completed successfully.`,
              }
            : { ok: true },
        })
      }).as('workflowAction')

      openAction(testCase.label)

      if (testCase.dialog) {
        confirmDialog(testCase.dialog)
      } else if (testCase.confirm) {
        confirmDialog()
      }

      cy.wait('@workflowAction')

      if (testCase.afterPath) {
        cy.wait('@loadArticleList')
        cy.location('pathname').should('eq', testCase.afterPath)
      } else {
        cy.wait('@loadArticle')
      }
    })
  })
})
