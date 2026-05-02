import { describe, expect, it } from 'vitest'

import {
  normalizeApiErrorMessage,
  unwrapApiResponsePayload,
  wrapApiErrorResult,
} from './responseEnvelope'

describe('responseEnvelope', () => {
  it('unwraps the server envelope without changing the inner payload shape', () => {
    const payload = {
      data: {
        events: [{ eventId: 'evt-001' }],
        pagination: { page: 2, limit: 10, total: 11, totalPages: 2 },
      },
      error: null,
    }

    expect(unwrapApiResponsePayload(payload)).toEqual(payload.data)
  })

  it('preserves legacy raw payloads that happen to contain a data collection', () => {
    const payload = {
      data: [{ eventId: 'evt-001' }],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    }

    expect(unwrapApiResponsePayload(payload)).toBe(payload)
  })

  it('normalizes structured envelope errors into legacy string errors', () => {
    const error = {
      response: {
        data: {
          data: null,
          error: {
            code: 'AUDIT_RESOURCE_FILTER_INVALID',
            message: 'resourceType and resourceId must be provided together.',
            details: { resourceType: 'article' },
          },
        },
      },
    }

    expect(normalizeApiErrorMessage(error)).toBe(
      'resourceType and resourceId must be provided together.',
    )
    expect(wrapApiErrorResult(error)).toEqual({
      error: 'resourceType and resourceId must be provided together.',
      errorCode: 'AUDIT_RESOURCE_FILTER_INVALID',
      errorDetails: { resourceType: 'article' },
    })
  })

  it('uses legacy response messages when no structured envelope error exists', () => {
    expect(
      normalizeApiErrorMessage({
        response: {
          data: {
            message: 'Legacy validation failed.',
          },
        },
      }),
    ).toBe('Legacy validation failed.')
  })
})
