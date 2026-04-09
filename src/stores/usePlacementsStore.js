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
    const res = await contentManagementAPI.placements.reorder({
      pageId,
      regionKey,
      placementIds,
    })
    if (res?.error) throw new Error(res.error)
    return res?.placements || []
  }

  return {
    ...base,
    reorder,
  }
})
