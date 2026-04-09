/**
 * Events API - Aligned with buildMakeRoutes endpoints
 * Supports full editorial workflow with scheduling and bulk operations
 */
import { buildMultipartPayload, hasBinaryValue } from './editorialEntityApi'

export default function ({ request }) {
  const url = '/events'

  function normalizeCollectionPayload(payload = {}, collectionKey = 'items') {
    const items = payload?.[collectionKey] || payload?.items || payload?.data || []
    const pagination = payload?.pagination || {}
    const limit = Number(payload?.limit || pagination?.limit || 0)
    const total = Number(payload?.total || pagination?.total || items.length || 0)

    return {
      ...payload,
      items,
      [collectionKey]: items,
      page: Number(payload?.page || pagination?.page || 1),
      limit,
      total,
      totalPages: Number(
        payload?.totalPages ||
          pagination?.totalPages ||
          (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1),
      ),
    }
  }

  return Object.freeze({
    /* ==================== READ OPERATIONS ==================== */
    listEvents,
    findEvent,
    listPublishedEvents,
    listArchivedEvents,
    findFeaturedEvents,
    findUpcomingEvents,
    findOngoingEvents,
    findPastEvents,
    searchEvents,

    /* ==================== CREATE OPERATIONS ==================== */
    createEvent,
    createEvents, // Bulk

    /* ==================== UPDATE OPERATIONS ==================== */
    updateEvent,
    updateEvents, // Bulk

    /* ==================== DELETE OPERATIONS ==================== */
    deleteEvent,
    deleteEvents, // Bulk
    softDeleteEvent,
    softDeleteEvents, // Bulk

    /* ==================== RESTORE OPERATIONS ==================== */
    restoreEvent,
    restoreEvents, // Bulk

    /* ==================== PUBLICATION WORKFLOW ==================== */
    submitEventForApproval,
    approveEvent,
    rejectEvent,
    publishEvent,
    unpublishEvent,
    publishEvents, // Bulk
    unpublishEvents, // Bulk

    /* ==================== SCHEDULING ==================== */
    scheduleEventPublish,
    scheduleEventUnpublish,
    cancelEventPublishSchedule,
    cancelEventUnpublishSchedule,
    scheduleEventsPublish, // Bulk
    scheduleEventsUnpublish, // Bulk
    cancelEventsPublishSchedule, // Bulk
    cancelEventsUnpublishSchedule, // Bulk
    processScheduledEvents,

    /* ==================== ARCHIVING ==================== */
    archiveEvent,
    restoreArchivedEvent,
    archiveEvents, // Bulk
    restoreArchivedEvents, // Bulk
  })

  /* ==================== READ OPERATIONS ==================== */

  async function listEvents(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return normalizeCollectionPayload(data, 'events')
    } catch (error) {
      return { error }
    }
  }

  async function findEvent({ eventId }) {
    try {
      const { data } = await request.get(`${url}/${eventId}`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function listPublishedEvents(query = {}) {
    try {
      const { data } = await request.get(`${url}/published`, { params: query })
      return normalizeCollectionPayload(data, 'events')
    } catch (error) {
      return { error }
    }
  }

  async function listArchivedEvents(query = {}) {
    try {
      const { data } = await request.get(`${url}/archived`, { params: query })
      return normalizeCollectionPayload(data, 'events')
    } catch (error) {
      return { error }
    }
  }

  async function findFeaturedEvents(query = {}) {
    try {
      const { data } = await request.get(`${url}/featured`, { params: query })
      return normalizeCollectionPayload(data, 'events')
    } catch (error) {
      return { error }
    }
  }

  async function findUpcomingEvents(query = {}) {
    try {
      const { data } = await request.get(`${url}/upcoming`, { params: query })
      return normalizeCollectionPayload(data, 'events')
    } catch (error) {
      return { error }
    }
  }

  async function findOngoingEvents(query = {}) {
    try {
      const { data } = await request.get(`${url}/ongoing`, { params: query })
      return normalizeCollectionPayload(data, 'events')
    } catch (error) {
      return { error }
    }
  }

  async function findPastEvents(query = {}) {
    try {
      const { data } = await request.get(`${url}/past`, { params: query })
      return normalizeCollectionPayload(data, 'events')
    } catch (error) {
      return { error }
    }
  }

  async function searchEvents(query = {}) {
    try {
      const { data } = await request.get(`${url}/search`, { params: query })
      return normalizeCollectionPayload(data, 'events')
    } catch (error) {
      return { error }
    }
  }

  /* ==================== CREATE OPERATIONS ==================== */

  async function createEvent({ eventInfo }) {
    const body = eventInfo || {}
    const requestBody = hasBinaryValue(body) ? buildMultipartPayload(body) : body
    try {
      const { data } = await request.post(`${url}/create`, requestBody, {
        headers: hasBinaryValue(body) ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function createEvents({ items }) {
    try {
      const { data } = await request.post(`${url}/bulk/create`, { items })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== UPDATE OPERATIONS ==================== */

  async function updateEvent({ eventId, ...eventInfo }) {
    const requestBody = hasBinaryValue(eventInfo) ? buildMultipartPayload(eventInfo) : eventInfo
    try {
      const { data } = await request.put(`${url}/${eventId}/update`, requestBody, {
        headers: hasBinaryValue(eventInfo) ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function updateEvents({ items }) {
    try {
      const { data } = await request.put(`${url}/bulk/update`, { items })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== DELETE OPERATIONS ==================== */

  async function deleteEvent({ eventId }) {
    try {
      const { data } = await request.delete(`${url}/${eventId}/delete`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function deleteEvents({ ids }) {
    try {
      const { data } = await request.delete(`${url}/bulk/delete`, { data: { ids } })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function softDeleteEvent({ eventId, reason }) {
    try {
      const { data } = await request.put(`${url}/${eventId}/soft-delete`, { reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function softDeleteEvents({ ids, reason }) {
    try {
      const { data } = await request.put(`${url}/bulk/soft-delete`, { ids, reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== RESTORE OPERATIONS ==================== */

  async function restoreEvent({ eventId }) {
    try {
      const { data } = await request.put(`${url}/${eventId}/restore`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function restoreEvents({ ids }) {
    try {
      const { data } = await request.put(`${url}/bulk/restore`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== PUBLICATION WORKFLOW ==================== */

  async function submitEventForApproval({ eventId }) {
    try {
      const { data } = await request.put(`${url}/${eventId}/submit`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function approveEvent({ eventId }) {
    try {
      const { data } = await request.put(`${url}/${eventId}/approve`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function rejectEvent({ eventId, reason }) {
    try {
      const { data } = await request.put(`${url}/${eventId}/reject`, { reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function publishEvent({ eventId }) {
    try {
      const { data } = await request.put(`${url}/${eventId}/publish`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function unpublishEvent({ eventId }) {
    try {
      const { data } = await request.put(`${url}/${eventId}/unpublish`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function publishEvents({ ids }) {
    try {
      const { data } = await request.put(`${url}/bulk/publish`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function unpublishEvents({ ids }) {
    try {
      const { data } = await request.put(`${url}/bulk/unpublish`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== SCHEDULING ==================== */

  async function scheduleEventPublish({ eventId, scheduledPublishAt, timezone }) {
    try {
      const { data } = await request.put(`${url}/${eventId}/schedule-publish`, {
        scheduledPublishAt,
        timezone,
      })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function scheduleEventUnpublish({ eventId, scheduledUnpublishAt, timezone }) {
    try {
      const { data } = await request.put(`${url}/${eventId}/schedule-unpublish`, {
        scheduledUnpublishAt,
        timezone,
      })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelEventPublishSchedule({ eventId }) {
    try {
      const { data } = await request.put(`${url}/${eventId}/cancel-publish-schedule`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelEventUnpublishSchedule({ eventId }) {
    try {
      const { data } = await request.put(`${url}/${eventId}/cancel-unpublish-schedule`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function scheduleEventsPublish({ items }) {
    try {
      const { data } = await request.put(`${url}/bulk/schedule-publish`, { items })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function scheduleEventsUnpublish({ items }) {
    try {
      const { data } = await request.put(`${url}/bulk/schedule-unpublish`, { items })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelEventsPublishSchedule({ ids }) {
    try {
      const { data } = await request.put(`${url}/bulk/cancel-publish-schedule`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelEventsUnpublishSchedule({ ids }) {
    try {
      const { data } = await request.put(`${url}/bulk/cancel-unpublish-schedule`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function processScheduledEvents() {
    try {
      const { data } = await request.post(`${url}/process-scheduled`)
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== ARCHIVING ==================== */

  async function archiveEvent({ eventId, reason }) {
    try {
      const { data } = await request.put(`${url}/${eventId}/archive`, { reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function restoreArchivedEvent({ eventId }) {
    try {
      const { data } = await request.put(`${url}/${eventId}/restore-archive`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function archiveEvents({ ids, reason }) {
    try {
      const { data } = await request.put(`${url}/bulk/archive`, { ids, reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function restoreArchivedEvents({ ids }) {
    try {
      const { data } = await request.put(`${url}/bulk/restore-archive`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }
}
