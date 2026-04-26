import { defineStore } from 'pinia'
import { ref } from 'vue'

import { eventsAPI } from '@/api'
import {
  createWorkflowApiAdapter,
  createWorkflowBoundStore,
  loadWorkflowEntities,
  loadWorkflowCollection,
} from '@/stores/_shared/workflowStoreHelpers'

function buildEventsApiAdapter() {
  return createWorkflowApiAdapter({
    api: eventsAPI,
    idField: 'eventId',
    payloadKey: 'eventInfo',
    methods: {
      list: 'listEvents',
      find: 'findEvent',
      listPublished: 'listPublishedEvents',
      listArchived: 'listArchivedEvents',
      create: 'createEvent',
      bulkCreate: 'createEvents',
      update: 'updateEvent',
      bulkUpdate: 'updateEvents',
      remove: 'deleteEvent',
      bulkRemove: 'deleteEvents',
      softDelete: 'softDeleteEvent',
      bulkSoftDelete: 'softDeleteEvents',
      restore: 'restoreEvent',
      bulkRestore: 'restoreEvents',
      submit: 'submitEventForApproval',
      approve: 'approveEvent',
      reject: 'rejectEvent',
      publish: 'publishEvent',
      bulkPublish: 'publishEvents',
      unpublish: 'unpublishEvent',
      bulkUnpublish: 'unpublishEvents',
      schedulePublish: 'scheduleEventPublish',
      scheduleUnpublish: 'scheduleEventUnpublish',
      bulkSchedulePublish: 'scheduleEventsPublish',
      bulkScheduleUnpublish: 'scheduleEventsUnpublish',
      cancelPublishSchedule: 'cancelEventPublishSchedule',
      cancelUnpublishSchedule: 'cancelEventUnpublishSchedule',
      bulkCancelPublishSchedule: 'cancelEventsPublishSchedule',
      bulkCancelUnpublishSchedule: 'cancelEventsUnpublishSchedule',
      archive: 'archiveEvent',
      bulkArchive: 'archiveEvents',
      restoreArchived: 'restoreArchivedEvent',
      bulkRestoreArchived: 'restoreArchivedEvents',
      processScheduled: 'processScheduledEvents',
    },
  })
}

export const useEventsStore = defineStore('events', () => {
  return createWorkflowBoundStore({
    workflowConfig: {
      api: buildEventsApiAdapter(),
      idField: 'eventId',
      entityKey: 'event',
      collectionKeys: ['events'],
      detailsRouteName: 'events.details',
      navigateOnUpdate: true,
    },
    bindings: {
      entityRefKey: 'event',
      collectionRefKey: 'events',
      publishedRefKey: 'publishedEvents',
      archivedRefKey: 'archivedEvents',
      hasRefKey: 'hasEvent',
      singular: 'Event',
      plural: 'Events',
      includeProcessScheduled: true,
    },
    extraState() {
      return {
        featuredEvents: ref([]),
        upcomingEvents: ref([]),
        ongoingEvents: ref([]),
        pastEvents: ref([]),
      }
    },
    extraActions({ workflowStore, featuredEvents, upcomingEvents, ongoingEvents, pastEvents }) {
      return {
        findFeaturedEvents(query = {}) {
          return loadWorkflowCollection({
            workflowStore,
            request: eventsAPI.findFeaturedEvents,
            target: featuredEvents,
            keys: ['items', 'events', 'data'],
            query,
          })
        },
        findUpcomingEvents(query = {}) {
          return loadWorkflowCollection({
            workflowStore,
            request: eventsAPI.findUpcomingEvents,
            target: upcomingEvents,
            keys: ['items', 'events', 'data'],
            query,
          })
        },
        findOngoingEvents(query = {}) {
          return loadWorkflowCollection({
            workflowStore,
            request: eventsAPI.findOngoingEvents,
            target: ongoingEvents,
            keys: ['items', 'events', 'data'],
            query,
          })
        },
        findPastEvents(query = {}) {
          return loadWorkflowCollection({
            workflowStore,
            request: eventsAPI.findPastEvents,
            target: pastEvents,
            keys: ['items', 'events', 'data'],
            query,
          })
        },
        searchEvents(query = {}) {
          return loadWorkflowEntities({
            workflowStore,
            request: eventsAPI.searchEvents,
            keys: ['items', 'events', 'data'],
            query,
          })
        },
      }
    },
  })
})
