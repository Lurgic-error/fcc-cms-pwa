import { contentManagementAPI } from '@/api'
import { createWorkflowEntityStore } from '@/stores/_shared/createWorkflowEntityStore'
import { defineStore } from 'pinia'

export const useContentVersionsStore = defineStore('cms-content-versions', () => {
  const base = createWorkflowEntityStore({
    api: contentManagementAPI.contentVersions,
    idField: 'contentVersionId',
    entityKey: 'contentVersion',
    collectionKeys: ['contentVersions', 'items'],
  })

  async function createForItem(contentItemId, payload = {}) {
    const res = await contentManagementAPI.createContentVersionForItem(contentItemId, payload)
    if (res?.error) throw new Error(res.error)
    return res?.contentVersion || res
  }

  return {
    ...base,
    createForItem,
  }
})
