import { describe, expect, it } from 'vitest'

import errorRoutes from './errorRoutes'

describe('errorRoutes', () => {
  it('registers an explicit server error route before the catch-all', () => {
    const serverErrorIndex = errorRoutes.findIndex((route) => route.path === '/server-error')
    const catchAllIndex = errorRoutes.findIndex((route) => route.path === '/:pathMatch(.*)*')
    const serverErrorRoute = errorRoutes[serverErrorIndex]

    expect(serverErrorIndex).toBeGreaterThan(-1)
    expect(catchAllIndex).toBeGreaterThan(serverErrorIndex)
    expect(serverErrorRoute.children[0].name).toBe('serverError')
  })
})
