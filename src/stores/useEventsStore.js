import { eventsAPI } from '@/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAsyncState } from '@/stores/_shared/useAsyncState'
import { useEntityState } from '@/stores/_shared/useEntityState'
import { usePagination } from '@/stores/_shared/usePagination'
import {
  getEffectiveWorkflowStatus,
  withWorkflowState,
  withWorkflowStateList,
} from '@/utils/contentWorkflow'

export const useEventsStore = defineStore('events', () => {
  const router = useRouter()

  /* ==================== SHARED FOUNDATIONS ==================== */

  const { loading, error, clearError, handleError, withAsync } = useAsyncState()
  const { pagination, setPagination } = usePagination()

  const { entity: event, entities: events, hasEntity: hasEvent, clearEntity } = useEntityState()

  /* ==================== EXTRA STATE ==================== */

  const publishedEvents = ref([])
  const archivedEvents = ref([])
  const featuredEvents = ref([])
  const upcomingEvents = ref([])
  const ongoingEvents = ref([])
  const pastEvents = ref([])

  /* ==================== COMPUTED ==================== */

  const isPublished = computed(() => getEffectiveWorkflowStatus(event.value) === 'published')
  const isArchived = computed(() => getEffectiveWorkflowStatus(event.value) === 'archived')
  const isScheduled = computed(() => getEffectiveWorkflowStatus(event.value) === 'scheduled')

  /* ==================== INTERNAL HELPERS ==================== */

  function goToDetails(eventId) {
    router.push({
      name: 'events.details',
      params: { eventId },
    })
  }

  async function refreshList(query = {}) {
    await listEvents(query)
  }

  /* ==================== READ ==================== */

  async function listEvents(query = {}) {
    return withAsync(async () => {
      const res = await eventsAPI.listEvents(query)
      if (res?.error) handleError(res)

      events.value = withWorkflowStateList(res.items || res.events || res.data || [])
      setPagination(res)
      return events.value
    })
  }

  async function findEvent(eventId) {
    return withAsync(async () => {
      const res = await eventsAPI.findEvent({ eventId })
      if (res?.error) handleError(res)

      event.value = withWorkflowState(res.event || res)
      return event.value
    })
  }

  async function listPublishedEvents(query = {}) {
    return withAsync(async () => {
      const res = await eventsAPI.listPublishedEvents(query)
      if (res?.error) handleError(res)

      publishedEvents.value = withWorkflowStateList(res.items || res.events || res.data || [])
      return publishedEvents.value
    })
  }

  async function listArchivedEvents(query = {}) {
    return withAsync(async () => {
      const res = await eventsAPI.listArchivedEvents(query)
      if (res?.error) handleError(res)

      archivedEvents.value = withWorkflowStateList(res.items || res.events || res.data || [])
      return archivedEvents.value
    })
  }

  async function findFeaturedEvents(query = {}) {
    return withAsync(async () => {
      const res = await eventsAPI.findFeaturedEvents(query)
      if (res?.error) handleError(res)

      featuredEvents.value = withWorkflowStateList(res.items || res.events || res.data || [])
      return featuredEvents.value
    })
  }

  async function findUpcomingEvents(query = {}) {
    return withAsync(async () => {
      const res = await eventsAPI.findUpcomingEvents(query)
      if (res?.error) handleError(res)

      upcomingEvents.value = withWorkflowStateList(res.items || res.events || res.data || [])
      return upcomingEvents.value
    })
  }

  async function findOngoingEvents(query = {}) {
    return withAsync(async () => {
      const res = await eventsAPI.findOngoingEvents(query)
      if (res?.error) handleError(res)

      ongoingEvents.value = withWorkflowStateList(res.items || res.events || res.data || [])
      return ongoingEvents.value
    })
  }

  async function findPastEvents(query = {}) {
    return withAsync(async () => {
      const res = await eventsAPI.findPastEvents(query)
      if (res?.error) handleError(res)

      pastEvents.value = withWorkflowStateList(res.items || res.events || res.data || [])
      return pastEvents.value
    })
  }

  async function searchEvents(query = {}) {
    return withAsync(async () => {
      const res = await eventsAPI.searchEvents(query)
      if (res?.error) handleError(res)

      events.value = withWorkflowStateList(res.items || res.events || res.data || [])
      return events.value
    })
  }

  /* ==================== CREATE ==================== */

  async function createEvent(eventInfo) {
    return withAsync(async () => {
      const res = await eventsAPI.createEvent({ eventInfo })
      if (res?.error) handleError(res)

      event.value = withWorkflowState(res.event || res)
      if (event.value?.eventId) goToDetails(event.value.eventId)

      return event.value
    })
  }

  async function createEvents(items) {
    return withAsync(async () => {
      const res = await eventsAPI.createEvents({ items })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  /* ==================== UPDATE ==================== */

  async function updateEvent(eventId, eventInfo) {
    return withAsync(async () => {
      const res = await eventsAPI.updateEvent({ eventId, ...eventInfo })
      if (res?.error) handleError(res)

      event.value = withWorkflowState(res.event || res)
      goToDetails(eventId)
      return event.value
    })
  }

  async function updateEvents(items) {
    return withAsync(async () => {
      const res = await eventsAPI.updateEvents({ items })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  /* ==================== DELETE ==================== */

  async function deleteEvent(eventId) {
    return withAsync(async () => {
      const res = await eventsAPI.deleteEvent({ eventId })
      if (res?.error) handleError(res)

      clearEntity()
      await refreshList()
      return res
    })
  }

  async function deleteEvents(ids) {
    return withAsync(async () => {
      const res = await eventsAPI.deleteEvents({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function softDeleteEvent(eventId, reason) {
    return withAsync(async () => {
      const res = await eventsAPI.softDeleteEvent({ eventId, reason })
      if (res?.error) handleError(res)

      event.value = withWorkflowState(res.event || res)
      return event.value
    })
  }

  async function softDeleteEvents(ids, reason) {
    return withAsync(async () => {
      const res = await eventsAPI.softDeleteEvents({ ids, reason })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  /* ==================== RESTORE ==================== */

  async function restoreEvent(eventId) {
    return withAsync(async () => {
      const res = await eventsAPI.restoreEvent({ eventId })
      if (res?.error) handleError(res)

      event.value = withWorkflowState(res.event || res)
      return event.value
    })
  }

  async function restoreEvents(ids) {
    return withAsync(async () => {
      const res = await eventsAPI.restoreEvents({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  /* ==================== WORKFLOW / SCHEDULING / ARCHIVE ==================== */

  async function submitEventForApproval(eventId) {
    return withAsync(async () => {
      const res = await eventsAPI.submitEventForApproval({ eventId })
      if (res?.error) handleError(res)

      event.value = withWorkflowState(res.event || res)
      return event.value
    })
  }

  async function approveEvent(eventId) {
    return withAsync(async () => {
      const res = await eventsAPI.approveEvent({ eventId })
      if (res?.error) handleError(res)

      event.value = withWorkflowState(res.event || res)
      return event.value
    })
  }

  async function rejectEvent(eventId, reason) {
    return withAsync(async () => {
      const res = await eventsAPI.rejectEvent({ eventId, reason })
      if (res?.error) handleError(res)

      event.value = withWorkflowState(res.event || res)
      return event.value
    })
  }

  async function publishEvent(eventId) {
    return withAsync(async () => {
      const res = await eventsAPI.publishEvent({ eventId })
      if (res?.error) handleError(res)

      event.value = withWorkflowState(res.event || res)
      return event.value
    })
  }

  async function unpublishEvent(eventId) {
    return withAsync(async () => {
      const res = await eventsAPI.unpublishEvent({ eventId })
      if (res?.error) handleError(res)

      event.value = withWorkflowState(res.event || res)
      return event.value
    })
  }

  async function scheduleEventPublish(eventId, payload = {}) {
    return withAsync(async () => {
      const res = await eventsAPI.scheduleEventPublish({
        eventId,
        scheduledPublishAt: payload?.scheduledPublishAt ?? payload,
        timezone: payload?.timezone,
      })
      if (res?.error) handleError(res)

      event.value = withWorkflowState(res.event || res)
      return event.value
    })
  }

  async function scheduleEventUnpublish(eventId, payload = {}) {
    return withAsync(async () => {
      const res = await eventsAPI.scheduleEventUnpublish({
        eventId,
        scheduledUnpublishAt: payload?.scheduledUnpublishAt ?? payload,
        timezone: payload?.timezone,
      })
      if (res?.error) handleError(res)

      event.value = withWorkflowState(res.event || res)
      return event.value
    })
  }

  async function cancelEventPublishSchedule(eventId) {
    return withAsync(async () => {
      const res = await eventsAPI.cancelEventPublishSchedule({ eventId })
      if (res?.error) handleError(res)

      event.value = withWorkflowState(res.event || res)
      return event.value
    })
  }

  async function cancelEventUnpublishSchedule(eventId) {
    return withAsync(async () => {
      const res = await eventsAPI.cancelEventUnpublishSchedule({ eventId })
      if (res?.error) handleError(res)

      event.value = withWorkflowState(res.event || res)
      return event.value
    })
  }

  async function scheduleEventsPublish(items) {
    return withAsync(async () => {
      const res = await eventsAPI.scheduleEventsPublish({ items })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function scheduleEventsUnpublish(items) {
    return withAsync(async () => {
      const res = await eventsAPI.scheduleEventsUnpublish({ items })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function cancelEventsPublishSchedule(ids) {
    return withAsync(async () => {
      const res = await eventsAPI.cancelEventsPublishSchedule({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function cancelEventsUnpublishSchedule(ids) {
    return withAsync(async () => {
      const res = await eventsAPI.cancelEventsUnpublishSchedule({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function publishEvents(ids) {
    return withAsync(async () => {
      const res = await eventsAPI.publishEvents({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function unpublishEvents(ids) {
    return withAsync(async () => {
      const res = await eventsAPI.unpublishEvents({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function processScheduledEvents() {
    return withAsync(async () => {
      const res = await eventsAPI.processScheduledEvents()
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function archiveEvent(eventId, reason) {
    return withAsync(async () => {
      const res = await eventsAPI.archiveEvent({ eventId, reason })
      if (res?.error) handleError(res)

      event.value = withWorkflowState(res.event || res)
      return event.value
    })
  }

  async function restoreArchivedEvent(eventId) {
    return withAsync(async () => {
      const res = await eventsAPI.restoreArchivedEvent({ eventId })
      if (res?.error) handleError(res)

      event.value = withWorkflowState(res.event || res)
      return event.value
    })
  }

  async function archiveEvents(ids, reason) {
    return withAsync(async () => {
      const res = await eventsAPI.archiveEvents({ ids, reason })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function restoreArchivedEvents(ids) {
    return withAsync(async () => {
      const res = await eventsAPI.restoreArchivedEvents({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  /* ==================== EXPORT ==================== */

  return {
    loading,
    error,
    clearError,
    pagination,

    event,
    events,
    publishedEvents,
    archivedEvents,
    featuredEvents,
    upcomingEvents,
    ongoingEvents,
    pastEvents,

    hasEvent,
    isPublished,
    isArchived,
    isScheduled,

    listEvents,
    findEvent,
    listPublishedEvents,
    listArchivedEvents,
    findFeaturedEvents,
    findUpcomingEvents,
    findOngoingEvents,
    findPastEvents,
    searchEvents,

    createEvent,
    createEvents,
    updateEvent,
    updateEvents,

    deleteEvent,
    deleteEvents,
    softDeleteEvent,
    softDeleteEvents,

    restoreEvent,
    restoreEvents,

    submitEventForApproval,
    approveEvent,
    rejectEvent,
    publishEvent,
    unpublishEvent,
    publishEvents,
    unpublishEvents,
    scheduleEventPublish,
    scheduleEventUnpublish,
    cancelEventPublishSchedule,
    cancelEventUnpublishSchedule,
    scheduleEventsPublish,
    scheduleEventsUnpublish,
    cancelEventsPublishSchedule,
    cancelEventsUnpublishSchedule,

    processScheduledEvents,

    archiveEvent,
    restoreArchivedEvent,
    archiveEvents,
    restoreArchivedEvents,

    submit: submitEventForApproval,
    submitForApproval: submitEventForApproval,
    approve: approveEvent,
    reject: rejectEvent,
    publish: publishEvent,
    unpublish: unpublishEvent,
    schedulePublish: scheduleEventPublish,
    scheduleUnpublish: scheduleEventUnpublish,
    cancelPublishSchedule: cancelEventPublishSchedule,
    cancelUnpublishSchedule: cancelEventUnpublishSchedule,
    archive: archiveEvent,
    restoreArchived: restoreArchivedEvent,
    softDelete: softDeleteEvent,
    restore: restoreEvent,
    remove: deleteEvent,
    bulkPublish: publishEvents,
    bulkUnpublish: unpublishEvents,
    bulkSchedulePublish: scheduleEventsPublish,
    bulkScheduleUnpublish: scheduleEventsUnpublish,
    bulkCancelPublishSchedule: cancelEventsPublishSchedule,
    bulkCancelUnpublishSchedule: cancelEventsUnpublishSchedule,
    bulkArchive: archiveEvents,
    bulkRestore: restoreEvents,
    bulkRestoreArchived: restoreArchivedEvents,
    bulkSoftDelete: softDeleteEvents,
    bulkRemove: deleteEvents,
  }
})
