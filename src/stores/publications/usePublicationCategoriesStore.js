import { defineStore } from 'pinia'

import { publicationsAPI } from '@/api'
import {
  createWorkflowApiAdapter,
  createWorkflowBoundStore,
  loadWorkflowEntities,
} from '@/stores/_shared/workflowStoreHelpers'

function buildPublicationCategoriesApiAdapter() {
  return createWorkflowApiAdapter({
    api: publicationsAPI,
    idField: 'categoryId',
    methods: {
      list: 'listPublicationCategories',
      find: 'findPublicationCategory',
      listPublished: 'listPublishedCategories',
      listArchived: 'listArchivedCategories',
      create: 'createPublicationCategory',
      update: 'updatePublicationCategory',
      remove: 'deletePublicationCategory',
      bulkRemove: 'deletePublicationCategories',
      softDelete: 'softDeleteCategory',
      bulkSoftDelete: 'softDeleteCategories',
      restore: 'restoreCategory',
      bulkRestore: 'restoreCategories',
      submit: 'submitPublicationCategoryForApproval',
      approve: 'approvePublicationCategory',
      reject: 'rejectPublicationCategory',
      publish: 'publishCategory',
      bulkPublish: 'publishCategories',
      unpublish: 'unpublishCategory',
      bulkUnpublish: 'unpublishCategories',
      schedulePublish: 'schedulePublicationCategoryPublish',
      scheduleUnpublish: 'schedulePublicationCategoryUnpublish',
      bulkSchedulePublish: 'schedulePublicationCategoriesPublish',
      bulkScheduleUnpublish: 'schedulePublicationCategoriesUnpublish',
      cancelPublishSchedule: 'cancelPublicationCategoryPublishSchedule',
      cancelUnpublishSchedule: 'cancelPublicationCategoryUnpublishSchedule',
      bulkCancelPublishSchedule: 'cancelPublicationCategoriesPublishSchedule',
      bulkCancelUnpublishSchedule: 'cancelPublicationCategoriesUnpublishSchedule',
      archive: 'archiveCategory',
      bulkArchive: 'archiveCategories',
      restoreArchived: 'restoreArchivedCategory',
      bulkRestoreArchived: 'restoreArchivedCategories',
    },
    wrapCreatePayload: false,
  })
}

export const usePublicationCategoriesStore = defineStore('publicationCategories', () => {
  return createWorkflowBoundStore({
    workflowConfig: {
      api: buildPublicationCategoriesApiAdapter(),
      idField: 'categoryId',
      entityKey: 'category',
      collectionKeys: ['categories'],
      detailsRouteName: 'publicationCategories.details',
      navigateOnUpdate: true,
    },
    bindings: {
      entityRefKey: 'category',
      collectionRefKey: 'categories',
      publishedRefKey: 'publishedCategories',
      archivedRefKey: 'archivedCategories',
      hasRefKey: 'hasCategory',
      singular: 'Category',
      plural: 'Categories',
    },
    extraActions({ workflowStore }) {
      return {
        searchCategories(query = {}) {
          return loadWorkflowEntities({
            workflowStore,
            request: publicationsAPI.searchCategories,
            keys: ['items', 'categories', 'data'],
            query,
          })
        },
      }
    },
    aliasOverrides: ({ workflowStore }) => ({
      listCategories: workflowStore.list,
      findCategory: workflowStore.find,
      listPublishedCategories: workflowStore.listPublished,
      listArchivedCategories: workflowStore.listArchived,
      createCategory: workflowStore.create,
      updateCategory: workflowStore.update,
      deleteCategory: workflowStore.remove,
      deleteCategories: workflowStore.bulkRemove,
      softDeleteCategory: workflowStore.softDelete,
      softDeleteCategories: workflowStore.bulkSoftDelete,
      restoreCategory: workflowStore.restore,
      restoreCategories: workflowStore.bulkRestore,
      restoreArchivedCategory: workflowStore.restoreArchived,
      restoreArchivedCategories: workflowStore.bulkRestoreArchived,
      submitCategory: workflowStore.submit,
      approveCategory: workflowStore.approve,
      rejectCategory: workflowStore.reject,
      publishCategory: workflowStore.publish,
      publishCategories: workflowStore.bulkPublish,
      unpublishCategory: workflowStore.unpublish,
      unpublishCategories: workflowStore.bulkUnpublish,
      schedulePublishCategory: workflowStore.schedulePublish,
      scheduleUnpublishCategory: workflowStore.scheduleUnpublish,
      schedulePublishCategories: workflowStore.bulkSchedulePublish,
      scheduleUnpublishCategories: workflowStore.bulkScheduleUnpublish,
      cancelPublishSchedules: workflowStore.bulkCancelPublishSchedule,
      cancelUnpublishSchedules: workflowStore.bulkCancelUnpublishSchedule,
      archiveCategory: workflowStore.archive,
      archiveCategories: workflowStore.bulkArchive,
    }),
  })
})
