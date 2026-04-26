import { defineStore } from 'pinia'

import { publicationsAPI } from '@/api'
import {
  createWorkflowApiAdapter,
  createWorkflowBoundStore,
  loadWorkflowEntities,
  runWorkflowReloadingRequest,
} from '@/stores/_shared/workflowStoreHelpers'

function buildPublicationsApiAdapter() {
  return createWorkflowApiAdapter({
    api: publicationsAPI,
    idField: 'publicationId',
    payloadKey: 'publicationInfo',
    methods: {
      list: 'listPublications',
      find: 'findPublication',
      listPublished: 'listPublishedPublications',
      listArchived: 'listArchivedPublications',
      create: 'createPublication',
      bulkCreate: 'createPublications',
      update: 'updatePublication',
      bulkUpdate: 'updatePublications',
      remove: 'deletePublication',
      bulkRemove: 'deletePublications',
      softDelete: 'softDeletePublication',
      bulkSoftDelete: 'softDeletePublications',
      restore: 'restorePublication',
      bulkRestore: 'restorePublications',
      submit: 'submitPublicationForApproval',
      approve: 'approvePublication',
      reject: 'rejectPublication',
      publish: 'publishPublication',
      bulkPublish: 'publishPublications',
      unpublish: 'unpublishPublication',
      bulkUnpublish: 'unpublishPublications',
      schedulePublish: 'schedulePublicationPublish',
      scheduleUnpublish: 'schedulePublicationUnpublish',
      bulkSchedulePublish: 'schedulePublicationsPublish',
      bulkScheduleUnpublish: 'schedulePublicationsUnpublish',
      cancelPublishSchedule: 'cancelPublicationPublishSchedule',
      cancelUnpublishSchedule: 'cancelPublicationUnpublishSchedule',
      bulkCancelPublishSchedule: 'cancelPublicationsPublishSchedule',
      bulkCancelUnpublishSchedule: 'cancelPublicationsUnpublishSchedule',
      archive: 'archivePublication',
      bulkArchive: 'archivePublications',
      restoreArchived: 'restoreArchivedPublication',
      bulkRestoreArchived: 'restoreArchivedPublications',
      processScheduled: 'processScheduledPublications',
    },
  })
}

export const usePublicationsStore = defineStore('publications', () => {
  return createWorkflowBoundStore({
    workflowConfig: {
      api: buildPublicationsApiAdapter(),
      idField: 'publicationId',
      entityKey: 'publication',
      collectionKeys: ['publications'],
      detailsRouteName: 'publications.details',
      navigateOnUpdate: true,
    },
    bindings: {
      entityRefKey: 'publication',
      collectionRefKey: 'publications',
      publishedRefKey: 'publishedPublications',
      archivedRefKey: 'archivedPublications',
      hasRefKey: 'hasPublication',
      singular: 'Publication',
      plural: 'Publications',
      includeProcessScheduled: true,
    },
    extraActions({ workflowStore }) {
      return {
        searchPublications(query = {}) {
          return loadWorkflowEntities({
            workflowStore,
            request: publicationsAPI.searchPublications,
            keys: ['items', 'publications', 'data'],
            query,
          })
        },
        expirePublications() {
          return runWorkflowReloadingRequest({
            workflowStore,
            request: () => publicationsAPI.expirePublications(),
          })
        },
      }
    },
  })
})
