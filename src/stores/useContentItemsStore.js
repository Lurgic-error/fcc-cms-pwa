import { contentManagementAPI } from '@/api'
import { createWorkflowEntityStore } from '@/stores/_shared/createWorkflowEntityStore'
import { defineStore } from 'pinia'

export const useContentItemsStore = defineStore('cms-content-items', () => {
  return createWorkflowEntityStore({
    api: contentManagementAPI.contentItems,
    idField: 'contentItemId',
    entityKey: 'contentItem',
    collectionKeys: ['contentItems', 'items'],
  })
})
