import { describe, expect, it } from 'vitest'

import { getEffectiveWorkflowStatus, withWorkflowState } from './contentWorkflow'

describe('content workflow utilities', () => {
  it('prefers effective workflow status when present', () => {
    expect(getEffectiveWorkflowStatus({ effectiveStatus: 'Expired' })).toBe('expired')
  })

  it('falls back to archive and published flags for legacy records', () => {
    expect(getEffectiveWorkflowStatus({ isArchived: true })).toBe('archived')
    expect(getEffectiveWorkflowStatus({ published: true })).toBe('published')
  })

  it('decorates records with consistent live and scheduled booleans', () => {
    expect(withWorkflowState({ effectiveStatus: 'scheduled' })).toMatchObject({
      effectiveStatus: 'scheduled',
      isScheduled: true,
      isLive: false,
    })
  })
})
