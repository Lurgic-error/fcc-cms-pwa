import { contentManagementAPI } from '@/api'
import { createWorkflowEntityStore } from '@/stores/_shared/createWorkflowEntityStore'
import { defineStore } from 'pinia'

export const useBlockTypesStore = defineStore('cms-block-types', () => {
  return createWorkflowEntityStore({
    api: contentManagementAPI.blockTypes,
    idField: 'blockTypeId',
    entityKey: 'blockType',
    collectionKeys: ['blockTypes', 'items'],
  })
})
