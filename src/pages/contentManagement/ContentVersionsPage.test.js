import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(resolve('src/pages/contentManagement/ContentVersionsPage.vue'), 'utf8')

describe('ContentVersionsPage background selector', () => {
  it('exposes a structured background picker for managed homepage sections', () => {
    expect(source).toContain("'home.quality-policy'")
    expect(source).toContain("'home.trademark-search-cta'")
    expect(source).toContain('photosAPI.listPublishedPhotos')
    expect(source).toContain('backgroundForm.imageUrl')
    expect(source).toContain('mergeBackgroundSelection')
    expect(source).toContain('media.backgroundImage')
    expect(source).toContain('(payload.style || {}).background')
  })
})
