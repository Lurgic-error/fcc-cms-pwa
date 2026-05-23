import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it, vi } from 'vitest'

import { createRouterHistory } from './history'

describe('createRouterHistory', () => {
  it('passes the Vite base URL to HTML5 history', () => {
    const createWebHistory = vi.fn((base) => ({ type: 'web', base }))
    const createWebHashHistory = vi.fn()

    const history = createRouterHistory({
      baseUrl: '/admin/',
      routerMode: 'history',
      createWebHistory,
      createWebHashHistory,
    })

    expect(history).toEqual({ type: 'web', base: '/admin/' })
    expect(createWebHistory).toHaveBeenCalledWith('/admin/')
    expect(createWebHashHistory).not.toHaveBeenCalled()
  })

  it('passes the Vite base URL to hash history', () => {
    const createWebHistory = vi.fn()
    const createWebHashHistory = vi.fn((base) => ({ type: 'hash', base }))

    const history = createRouterHistory({
      baseUrl: '/admin/',
      routerMode: 'hash',
      createWebHistory,
      createWebHashHistory,
    })

    expect(history).toEqual({ type: 'hash', base: '/admin/' })
    expect(createWebHashHistory).toHaveBeenCalledWith('/admin/')
    expect(createWebHistory).not.toHaveBeenCalled()
  })
})

describe('Dockerfile', () => {
  it('forwards the Vite base path prefix build arg', () => {
    const dockerfile = readFileSync(resolve(process.cwd(), 'Dockerfile'), 'utf8')

    expect(dockerfile).toMatch(/^ARG VITE_BASE_PATH_PREFIX=/m)
    expect(dockerfile).toMatch(/^ENV VITE_BASE_PATH_PREFIX=\$VITE_BASE_PATH_PREFIX/m)
  })
})
