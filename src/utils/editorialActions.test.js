import { describe, expect, it } from 'vitest'

import { resolveEntityActionItems } from './editorialActions'

function makeAdapter(overrides = {}) {
  return {
    submit: () => {},
    approve: () => {},
    reject: () => {},
    publish: () => {},
    unpublish: () => {},
    schedulePublish: () => {},
    scheduleUnpublish: () => {},
    cancelPublishSchedule: () => {},
    cancelUnpublishSchedule: () => {},
    archive: () => {},
    restoreArchived: () => {},
    softDelete: () => {},
    restore: () => {},
    remove: () => {},
    ...overrides,
  }
}

function keys(actions = []) {
  return actions.map((action) => action.key)
}

describe('editorial action visibility', () => {
  it('shows submit for draft records and approve/reject for submitted records', () => {
    const adapter = makeAdapter()

    const draftActions = resolveEntityActionItems({
      record: { publicationStatus: 'draft' },
      adapter,
      hasPermission: () => true,
    })
    const submittedActions = resolveEntityActionItems({
      record: { publicationStatus: 'submitted' },
      adapter,
      hasPermission: () => true,
    })

    expect(keys(draftActions)).toContain('submit')
    expect(keys(draftActions)).not.toContain('approve')
    expect(keys(submittedActions)).toEqual(expect.arrayContaining(['approve', 'reject']))
  })

  it('shows schedule cancellation actions when schedule metadata exists', () => {
    const adapter = makeAdapter()

    const actions = resolveEntityActionItems({
      record: {
        publicationStatus: 'approved',
        scheduledPublishAt: '2026-03-20T10:30:00.000Z',
      },
      adapter,
      hasPermission: () => true,
    })

    expect(keys(actions)).toContain('cancelPublishSchedule')
    expect(keys(actions)).not.toContain('schedulePublish')
  })

  it('restricts deleted records to restore and permanent delete actions', () => {
    const adapter = makeAdapter()

    const actions = resolveEntityActionItems({
      record: {
        publicationStatus: 'draft',
        isDeleted: true,
      },
      adapter,
      hasPermission: () => true,
    })

    expect(keys(actions)).toEqual(expect.arrayContaining(['restore', 'delete']))
    expect(keys(actions)).not.toContain('submit')
    expect(keys(actions)).not.toContain('archive')
  })
})
