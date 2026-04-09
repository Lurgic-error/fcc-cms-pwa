import { describe, expect, it } from 'vitest'

import { buildCategoryVisibility, resolveCategoryId } from './publicationsWorkspace'

describe('publicationsWorkspace.resolveCategoryId', () => {
  it('prefers explicit category identifiers in priority order', () => {
    expect(resolveCategoryId({ category: { categoryId: 'cat-001', _id: 'mongo-cat-001' } })).toBe(
      'cat-001',
    )
    expect(resolveCategoryId({ categoryId: 'cat-002', category: { _id: 'mongo-cat-002' } })).toBe(
      'cat-002',
    )
    expect(resolveCategoryId({ category: { _id: 'mongo-cat-003' } })).toBe('mongo-cat-003')
    expect(resolveCategoryId({ category: 'cat-004' })).toBe('cat-004')
  })

  it('does not fall back to the parent publication mongo id', () => {
    expect(
      resolveCategoryId({
        publicationId: 'pub-001',
        _id: 'mongo-publication-001',
      }),
    ).toBe('')
  })

  it('treats manually published categories as public even before any publication goes live', () => {
    const visibility = buildCategoryVisibility({
      publicationStatus: 'published',
      isPubliclyVisible: true,
      isManualPublication: true,
      publishedPublicationCount: 0,
    })

    expect(visibility.label).toBe('Public')
    expect(visibility.isPublic).toBe(true)
  })

  it('keeps auto-published categories off the website when no publication is live anymore', () => {
    const visibility = buildCategoryVisibility({
      publicationStatus: 'published',
      isPubliclyVisible: false,
      isManualPublication: false,
      publishedPublicationCount: 0,
    })

    expect(visibility.label).toBe('Awaiting Content')
    expect(visibility.isPublic).toBe(false)
  })
})
