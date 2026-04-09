import { describe, expect, it, vi } from 'vitest'

import { runEntityBulkWorkflowAction, runEntityWorkflowAction } from './workflowActionDispatch'

function makeStore() {
  return {
    submit: vi.fn(),
    submitForApproval: vi.fn(),
    reject: vi.fn(),
    archive: vi.fn(),
    softDelete: vi.fn(),
    schedulePublish: vi.fn(),
    scheduleUnpublish: vi.fn(),
    cancelPublishSchedule: vi.fn(),
    restoreArchived: vi.fn(),
    remove: vi.fn(),
    bulkArchive: vi.fn(),
    bulkSoftDelete: vi.fn(),
    bulkSchedulePublish: vi.fn(),
    bulkScheduleUnpublish: vi.fn(),
    bulkCancelPublishSchedule: vi.fn(),
    bulkRestoreArchived: vi.fn(),
    bulkRemove: vi.fn(),
  }
}

describe('workflowActionDispatch', () => {
  it('routes single-record submit and delete actions to the expected store methods', async () => {
    const store = makeStore()

    await runEntityWorkflowAction(store, 'submit', 'pub-001')
    await runEntityWorkflowAction(store, 'delete', 'pub-001')

    expect(store.submit).toHaveBeenCalledWith('pub-001')
    expect(store.remove).toHaveBeenCalledWith('pub-001')
  })

  it('falls back to submitForApproval when a store only exposes that alias', async () => {
    const store = { submitForApproval: vi.fn() }

    await runEntityWorkflowAction(store, 'submit', 'cat-001')

    expect(store.submitForApproval).toHaveBeenCalledWith('cat-001')
  })

  it('passes reason and scheduling payloads through unchanged', async () => {
    const store = makeStore()
    const reasonPayload = { reason: 'Needs revision' }
    const schedulePayload = {
      scheduledPublishAt: '2026-03-20T10:30:00.000Z',
      timezone: 'Africa/Dar_es_Salaam',
    }

    await runEntityWorkflowAction(store, 'reject', 'pub-002', reasonPayload)
    await runEntityWorkflowAction(store, 'schedulePublish', 'pub-002', schedulePayload)
    await runEntityWorkflowAction(store, 'cancelPublishSchedule', 'pub-002')

    expect(store.reject).toHaveBeenCalledWith('pub-002', 'Needs revision')
    expect(store.schedulePublish).toHaveBeenCalledWith('pub-002', schedulePayload)
    expect(store.cancelPublishSchedule).toHaveBeenCalledWith('pub-002')
  })

  it('routes bulk actions to the correct store methods and payload shape', async () => {
    const store = makeStore()

    await runEntityBulkWorkflowAction(store, 'archive', {
      ids: ['pub-001', 'pub-002'],
      reason: 'Retention cleanup',
    })
    await runEntityBulkWorkflowAction(store, 'schedulePublish', {
      items: [
        {
          publicationId: 'pub-001',
          scheduledPublishAt: '2026-03-20T10:30:00.000Z',
          timezone: 'Africa/Dar_es_Salaam',
        },
      ],
    })
    await runEntityBulkWorkflowAction(store, 'restoreArchived', {
      ids: ['pub-001'],
    })
    await runEntityBulkWorkflowAction(store, 'delete', {
      ids: ['pub-001'],
    })

    expect(store.bulkArchive).toHaveBeenCalledWith(['pub-001', 'pub-002'], 'Retention cleanup')
    expect(store.bulkSchedulePublish).toHaveBeenCalledWith([
      {
        publicationId: 'pub-001',
        scheduledPublishAt: '2026-03-20T10:30:00.000Z',
        timezone: 'Africa/Dar_es_Salaam',
      },
    ])
    expect(store.bulkRestoreArchived).toHaveBeenCalledWith(['pub-001'])
    expect(store.bulkRemove).toHaveBeenCalledWith(['pub-001'])
  })
})
