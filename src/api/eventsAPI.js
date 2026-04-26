import { createEditorialCollectionApi } from './editorialEntityApi'

export default function ({ request }) {
  const api = createEditorialCollectionApi({
    request,
    baseUrl: '/events',
    collectionKey: 'events',
    searchPath: 'search',
    extraListEndpoints: {
      findFeaturedEvents: 'featured',
      findUpcomingEvents: 'upcoming',
      findOngoingEvents: 'ongoing',
      findPastEvents: 'past',
    },
    processScheduledPath: 'process-scheduled',
  })

  return Object.freeze({
    listEvents: api.list,
    findEvent: ({ eventId }) => api.find(eventId),
    listPublishedEvents: api.listPublished,
    listArchivedEvents: api.listArchived,
    findFeaturedEvents: api.findFeaturedEvents,
    findUpcomingEvents: api.findUpcomingEvents,
    findOngoingEvents: api.findOngoingEvents,
    findPastEvents: api.findPastEvents,
    searchEvents: api.search,

    createEvent: ({ eventInfo }) => api.create(eventInfo),
    createEvents: ({ items }) => api.bulkCreate({ items }),

    updateEvent: ({ eventId, ...eventInfo }) => api.update(eventId, eventInfo),
    updateEvents: ({ items }) => api.bulkUpdate({ items }),

    deleteEvent: ({ eventId }) => api.remove(eventId),
    deleteEvents: ({ ids }) => api.bulkRemove({ ids }),
    softDeleteEvent: ({ eventId, reason }) => api.softDelete(eventId, reason),
    softDeleteEvents: ({ ids, reason }) => api.bulkSoftDelete({ ids, reason }),

    restoreEvent: ({ eventId }) => api.restore(eventId),
    restoreEvents: ({ ids }) => api.bulkRestore({ ids }),

    submitEventForApproval: ({ eventId }) => api.submit(eventId),
    approveEvent: ({ eventId }) => api.approve(eventId),
    rejectEvent: ({ eventId, reason }) => api.reject(eventId, reason),
    publishEvent: ({ eventId }) => api.publish(eventId),
    unpublishEvent: ({ eventId }) => api.unpublish(eventId),
    publishEvents: ({ ids }) => api.bulkPublish({ ids }),
    unpublishEvents: ({ ids }) => api.bulkUnpublish({ ids }),

    scheduleEventPublish: ({ eventId, scheduledPublishAt, timezone }) =>
      api.schedulePublish(eventId, { scheduledPublishAt, timezone }),
    scheduleEventUnpublish: ({ eventId, scheduledUnpublishAt, timezone }) =>
      api.scheduleUnpublish(eventId, { scheduledUnpublishAt, timezone }),
    cancelEventPublishSchedule: ({ eventId }) => api.cancelPublishSchedule(eventId),
    cancelEventUnpublishSchedule: ({ eventId }) => api.cancelUnpublishSchedule(eventId),
    scheduleEventsPublish: ({ items }) => api.bulkSchedulePublish({ items }),
    scheduleEventsUnpublish: ({ items }) => api.bulkScheduleUnpublish({ items }),
    cancelEventsPublishSchedule: ({ ids }) => api.bulkCancelPublishSchedule({ ids }),
    cancelEventsUnpublishSchedule: ({ ids }) => api.bulkCancelUnpublishSchedule({ ids }),
    processScheduledEvents: api.processScheduled,

    archiveEvent: ({ eventId, reason }) => api.archive(eventId, reason),
    restoreArchivedEvent: ({ eventId }) => api.restoreArchived(eventId),
    archiveEvents: ({ ids, reason }) => api.bulkArchive({ ids, reason }),
    restoreArchivedEvents: ({ ids }) => api.bulkRestoreArchived({ ids }),
  })
}
