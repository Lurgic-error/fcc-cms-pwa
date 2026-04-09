import { describe, expect, it } from 'vitest'

import { extractErrorMessage, normalizeThrownError } from './httpError'

describe('httpError helpers', () => {
  it('prefers backend error payloads over generic Axios messages', () => {
    const message = extractErrorMessage({
      error: {
        message: 'Request failed with status code 409',
        response: {
          data: {
            error: 'This publication cannot be published until its category is approved.',
          },
        },
      },
    })

    expect(message).toBe('This publication cannot be published until its category is approved.')
  })

  it('returns an Error instance with the normalized friendly message', () => {
    const error = normalizeThrownError({
      error: {
        message: 'Request failed with status code 500',
        response: {
          data: {
            error:
              'The selected publication category could not be found. It may have been deleted or is no longer available.',
          },
        },
      },
    })

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe(
      'The selected publication category could not be found. It may have been deleted or is no longer available.',
    )
  })
})
