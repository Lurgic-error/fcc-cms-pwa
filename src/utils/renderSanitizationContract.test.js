import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

function readVueFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = join(directory, entry.name)
    if (entry.isDirectory()) return readVueFiles(filePath)
    return entry.name.endsWith('.vue') ? [filePath] : []
  })
}

describe('CMS PWA structured payload render contract', () => {
  it('does not inject content-management structured payloads through raw HTML sinks', () => {
    const files = readVueFiles(join(process.cwd(), 'src/pages/contentManagement'))
    const rawHtmlSinkFiles = []

    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      if (/\bv-html\s*=/.test(source) || /\.innerHTML\s*=/.test(source)) {
        rawHtmlSinkFiles.push(file)
      }
    }

    expect(rawHtmlSinkFiles).toEqual([])
  })
})
