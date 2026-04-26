import { contentManagementAPI } from '@/api'
import { createWorkflowEntityStore } from '@/stores/_shared/createWorkflowEntityStore'
import { defineStore } from 'pinia'

export const usePlacementsStore = defineStore('cms-placements', () => {
  const base = createWorkflowEntityStore({
    api: contentManagementAPI.placements,
    idField: 'placementId',
    entityKey: 'placement',
    collectionKeys: ['placements', 'items'],
  })

  async function reorder(pageId, regionKey, placementIds = []) {
    return base.withAsync(async () => {
      const res = await contentManagementAPI.placements.reorder({
        pageId,
        regionKey,
        placementIds,
      })
      if (res?.error) base.handleError(res)
      return base.setEntitiesState(res?.placements || [])
    })
  }

  return {
    ...base,
    reorder,
  }
})
