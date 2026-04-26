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
    return base.withAsync(async () => {
      const res = await contentManagementAPI.createContentVersionForItem(contentItemId, payload)
      if (res?.error) base.handleError(res)
      return base.setEntityState(res?.contentVersion || res)
    })
  }

  return {
    ...base,
    createForItem,
  }
})
