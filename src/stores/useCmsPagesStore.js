import { contentManagementAPI } from '@/api'
import { createWorkflowEntityStore } from '@/stores/_shared/createWorkflowEntityStore'
import { defineStore } from 'pinia'

export const useCmsPagesStore = defineStore('cms-pages', () => {
  return createWorkflowEntityStore({
    api: contentManagementAPI.pages,
    idField: 'pageId',
    entityKey: 'page',
    collectionKeys: ['pages', 'items'],
  })
})
