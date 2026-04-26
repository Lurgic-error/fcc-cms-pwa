import { describe, expect, it } from 'vitest'

import {
  buildUploadFileList,
  normalizeUploadEmission,
  normalizeUploadValue,
} from './appFileUploadFieldState'

describe('appFileUploadFieldState', () => {
  it('keeps persisted uploads alongside newly selected files', () => {
    const existingFile = {
      fileId: 'asset-001',
      name: 'existing.pdf',
      url: 'https://example.com/existing.pdf',
    }
    const nextFile = new File(['hello'], 'next.pdf', { type: 'application/pdf' })

    const uploadFiles = [
      ...buildUploadFileList([existingFile]),
      {
        name: nextFile.name,
        status: 'success',
        raw: nextFile,
      },
    ]

    expect(normalizeUploadEmission(uploadFiles)).toEqual([existingFile, nextFile])
  })

  it('returns a single persisted value for single-file fields', () => {
    const existingFile = {
      fileId: 'asset-002',
      filename: 'hero.jpg',
      url: 'https://example.com/hero.jpg',
    }

    const [uploadFile] = buildUploadFileList(normalizeUploadValue(existingFile))

    expect(normalizeUploadEmission([uploadFile], false)).toEqual(existingFile)
  })
})
