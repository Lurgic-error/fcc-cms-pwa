import { contentManagementAPI } from '@/api'
import { createWorkflowEntityStore } from '@/stores/_shared/createWorkflowEntityStore'
import { defineStore } from 'pinia'

export const useLayoutsStore = defineStore('cms-layouts', () => {
  return createWorkflowEntityStore({
    api: contentManagementAPI.layouts,
    idField: 'layoutId',
    entityKey: 'layout',
    collectionKeys: ['layouts', 'items'],
  })
})
