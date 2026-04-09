import { publicationsAPI } from '@/api'
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

export const usePublicationsStore = defineStore('publications', () => {
  const router = useRouter()

  /* ==================== SHARED FOUNDATIONS ==================== */

  const { loading, error, clearError, handleError, withAsync } = useAsyncState()
  const { pagination, setPagination } = usePagination()

  // standard entity shape
  const {
    entity: publication,
    entities: publications,
    hasEntity: hasPublication,
    clearEntity,
  } = useEntityState()

  /* ==================== EXTRA STATE ==================== */

  const publishedPublications = ref([])
  const archivedPublications = ref([])

  /* ==================== COMPUTED ==================== */

  const isPublished = computed(() => getEffectiveWorkflowStatus(publication.value) === 'published')
  const isArchived = computed(() => getEffectiveWorkflowStatus(publication.value) === 'archived')
  const isScheduled = computed(() => getEffectiveWorkflowStatus(publication.value) === 'scheduled')

  /* ==================== INTERNAL HELPERS ==================== */

  async function refreshList(query = {}) {
    await listPublications(query)
  }

  function goToDetails(publicationId) {
    // ✅ align to your new route naming discipline
    router.push({
      name: 'publications.details',
      params: { publicationId },
    })
  }

  /* ==================== READ ==================== */

  async function listPublications(query = {}) {
    return withAsync(async () => {
      const res = await publicationsAPI.listPublications(query)
      if (res?.error) handleError(res)

      publications.value = withWorkflowStateList(res.items || res.publications || [])
      setPagination(res)
      return publications.value
    })
  }

  async function findPublication(publicationId) {
    return withAsync(async () => {
      const res = await publicationsAPI.findPublication({ publicationId })
      if (res?.error) handleError(res)

      publication.value = withWorkflowState(res.publication || res)
      return publication.value
    })
  }

  async function listPublishedPublications(query = {}) {
    return withAsync(async () => {
      const res = await publicationsAPI.listPublishedPublications(query)
      if (res?.error) handleError(res)

      publishedPublications.value = withWorkflowStateList(res.items || res.publications || [])
      return publishedPublications.value
    })
  }

  async function listArchivedPublications(query = {}) {
    return withAsync(async () => {
      const res = await publicationsAPI.listArchivedPublications(query)
      if (res?.error) handleError(res)

      archivedPublications.value = withWorkflowStateList(res.items || res.publications || [])
      return archivedPublications.value
    })
  }

  async function searchPublications(query = {}) {
    return withAsync(async () => {
      const res = await publicationsAPI.searchPublications(query)
      if (res?.error) handleError(res)

      publications.value = withWorkflowStateList(res.items || res.publications || [])
      return publications.value
    })
  }

  /* ==================== CREATE ==================== */

  async function createPublication(publicationInfo) {
    return withAsync(async () => {
      const res = await publicationsAPI.createPublication({ publicationInfo })
      if (res?.error) handleError(res)

      publication.value = withWorkflowState(res.publication || res)

      const id = publication.value?.publicationId
      if (id) goToDetails(id)

      return publication.value
    })
  }

  async function createPublications(items) {
    return withAsync(async () => {
      const res = await publicationsAPI.createPublications({ items })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  /* ==================== UPDATE ==================== */

  async function updatePublication(publicationId, publicationInfo) {
    return withAsync(async () => {
      const res = await publicationsAPI.updatePublication({
        publicationId,
        ...publicationInfo,
      })
      if (res?.error) handleError(res)

      publication.value = withWorkflowState(res.publication || res)

      const id = publication.value?.publicationId || publicationId
      if (id) goToDetails(id)

      return publication.value
    })
  }

  async function updatePublications(items) {
    return withAsync(async () => {
      const res = await publicationsAPI.updatePublications({ items })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  /* ==================== DELETE ==================== */

  async function deletePublication(publicationId) {
    return withAsync(async () => {
      const res = await publicationsAPI.deletePublication({ publicationId })
      if (res?.error) handleError(res)

      clearEntity()
      await refreshList()
      return res
    })
  }

  async function deletePublications(ids) {
    return withAsync(async () => {
      const res = await publicationsAPI.deletePublications({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function softDeletePublication(publicationId, reason) {
    return withAsync(async () => {
      const res = await publicationsAPI.softDeletePublication({ publicationId, reason })
      if (res?.error) handleError(res)

      publication.value = withWorkflowState(res.publication || res)
      return publication.value
    })
  }

  async function softDeletePublications(ids, reason) {
    return withAsync(async () => {
      const res = await publicationsAPI.softDeletePublications({ ids, reason })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  /* ==================== RESTORE ==================== */

  async function restorePublication(publicationId) {
    return withAsync(async () => {
      const res = await publicationsAPI.restorePublication({ publicationId })
      if (res?.error) handleError(res)

      publication.value = withWorkflowState(res.publication || res)
      return publication.value
    })
  }

  async function restorePublications(ids) {
    return withAsync(async () => {
      const res = await publicationsAPI.restorePublications({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  /* ==================== WORKFLOW ==================== */

  async function submitPublicationForApproval(publicationId) {
    return withAsync(async () => {
      const res = await publicationsAPI.submitPublicationForApproval({ publicationId })
      if (res?.error) handleError(res)

      publication.value = withWorkflowState(res.publication || res)
      return publication.value
    })
  }

  async function approvePublication(publicationId) {
    return withAsync(async () => {
      const res = await publicationsAPI.approvePublication({ publicationId })
      if (res?.error) handleError(res)

      publication.value = withWorkflowState(res.publication || res)
      return publication.value
    })
  }

  async function rejectPublication(publicationId, reason) {
    return withAsync(async () => {
      const res = await publicationsAPI.rejectPublication({ publicationId, reason })
      if (res?.error) handleError(res)

      publication.value = withWorkflowState(res.publication || res)
      return publication.value
    })
  }

  async function publishPublication(publicationId) {
    return withAsync(async () => {
      const res = await publicationsAPI.publishPublication({ publicationId })
      if (res?.error) handleError(res)

      publication.value = withWorkflowState(res.publication || res)
      return publication.value
    })
  }

  async function unpublishPublication(publicationId) {
    return withAsync(async () => {
      const res = await publicationsAPI.unpublishPublication({ publicationId })
      if (res?.error) handleError(res)

      publication.value = withWorkflowState(res.publication || res)
      return publication.value
    })
  }

  async function publishPublications(ids) {
    return withAsync(async () => {
      const res = await publicationsAPI.publishPublications({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function unpublishPublications(ids) {
    return withAsync(async () => {
      const res = await publicationsAPI.unpublishPublications({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  /* ==================== SCHEDULING ==================== */

  async function schedulePublicationPublish(publicationId, payload = {}) {
    return withAsync(async () => {
      const res = await publicationsAPI.schedulePublicationPublish({
        publicationId,
        scheduledPublishAt: payload?.scheduledPublishAt ?? payload,
        timezone: payload?.timezone,
      })
      if (res?.error) handleError(res)

      publication.value = withWorkflowState(res.publication || res)
      return publication.value
    })
  }

  async function schedulePublicationUnpublish(publicationId, payload = {}) {
    return withAsync(async () => {
      const res = await publicationsAPI.schedulePublicationUnpublish({
        publicationId,
        scheduledUnpublishAt: payload?.scheduledUnpublishAt ?? payload,
        timezone: payload?.timezone,
      })
      if (res?.error) handleError(res)

      publication.value = withWorkflowState(res.publication || res)
      return publication.value
    })
  }

  async function cancelPublicationPublishSchedule(publicationId) {
    return withAsync(async () => {
      const res = await publicationsAPI.cancelPublicationPublishSchedule({ publicationId })
      if (res?.error) handleError(res)

      publication.value = withWorkflowState(res.publication || res)
      return publication.value
    })
  }

  async function cancelPublicationUnpublishSchedule(publicationId) {
    return withAsync(async () => {
      const res = await publicationsAPI.cancelPublicationUnpublishSchedule({ publicationId })
      if (res?.error) handleError(res)

      publication.value = withWorkflowState(res.publication || res)
      return publication.value
    })
  }

  async function schedulePublicationsPublish(items) {
    return withAsync(async () => {
      const res = await publicationsAPI.schedulePublicationsPublish({ items })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function schedulePublicationsUnpublish(items) {
    return withAsync(async () => {
      const res = await publicationsAPI.schedulePublicationsUnpublish({ items })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function cancelPublicationsPublishSchedule(ids) {
    return withAsync(async () => {
      const res = await publicationsAPI.cancelPublicationsPublishSchedule({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function cancelPublicationsUnpublishSchedule(ids) {
    return withAsync(async () => {
      const res = await publicationsAPI.cancelPublicationsUnpublishSchedule({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function processScheduledPublications() {
    return withAsync(async () => {
      const res = await publicationsAPI.processScheduledPublications()
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  /* ==================== ARCHIVING ==================== */

  async function archivePublication(publicationId, reason) {
    return withAsync(async () => {
      const res = await publicationsAPI.archivePublication({ publicationId, reason })
      if (res?.error) handleError(res)

      publication.value = withWorkflowState(res.publication || res)
      return publication.value
    })
  }

  async function restoreArchivedPublication(publicationId) {
    return withAsync(async () => {
      const res = await publicationsAPI.restoreArchivedPublication({ publicationId })
      if (res?.error) handleError(res)

      publication.value = withWorkflowState(res.publication || res)
      return publication.value
    })
  }

  async function archivePublications(ids, reason) {
    return withAsync(async () => {
      const res = await publicationsAPI.archivePublications({ ids, reason })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function restoreArchivedPublications(ids) {
    return withAsync(async () => {
      const res = await publicationsAPI.restoreArchivedPublications({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function expirePublications() {
    return withAsync(async () => {
      const res = await publicationsAPI.expirePublications()
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  /* ==================== EXPORT ==================== */

  return {
    // Async
    loading,
    error,
    clearError,

    // Pagination
    pagination,

    // State
    publication,
    publications,
    publishedPublications,
    archivedPublications,

    // Computed
    hasPublication,
    isPublished,
    isArchived,
    isScheduled,

    // Read
    listPublications,
    findPublication,
    listPublishedPublications,
    listArchivedPublications,
    searchPublications,

    // Create
    createPublication,
    createPublications,

    // Update
    updatePublication,
    updatePublications,

    // Delete
    deletePublication,
    deletePublications,
    softDeletePublication,
    softDeletePublications,

    // Restore
    restorePublication,
    restorePublications,

    // Workflow
    submitPublicationForApproval,
    approvePublication,
    rejectPublication,
    publishPublication,
    unpublishPublication,
    publishPublications,
    unpublishPublications,

    // Scheduling
    schedulePublicationPublish,
    schedulePublicationUnpublish,
    cancelPublicationPublishSchedule,
    cancelPublicationUnpublishSchedule,
    schedulePublicationsPublish,
    schedulePublicationsUnpublish,
    cancelPublicationsPublishSchedule,
    cancelPublicationsUnpublishSchedule,
    processScheduledPublications,

    // Archiving
    archivePublication,
    restoreArchivedPublication,
    archivePublications,
    restoreArchivedPublications,
    expirePublications,

    // Generic workflow aliases
    submit: submitPublicationForApproval,
    submitForApproval: submitPublicationForApproval,
    approve: approvePublication,
    reject: rejectPublication,
    publish: publishPublication,
    unpublish: unpublishPublication,
    schedulePublish: schedulePublicationPublish,
    scheduleUnpublish: schedulePublicationUnpublish,
    cancelPublishSchedule: cancelPublicationPublishSchedule,
    cancelUnpublishSchedule: cancelPublicationUnpublishSchedule,
    archive: archivePublication,
    restoreArchived: restoreArchivedPublication,
    softDelete: softDeletePublication,
    restore: restorePublication,
    remove: deletePublication,
    bulkPublish: publishPublications,
    bulkUnpublish: unpublishPublications,
    bulkSchedulePublish: schedulePublicationsPublish,
    bulkScheduleUnpublish: schedulePublicationsUnpublish,
    bulkCancelPublishSchedule: cancelPublicationsPublishSchedule,
    bulkCancelUnpublishSchedule: cancelPublicationsUnpublishSchedule,
    bulkArchive: archivePublications,
    bulkRestore: restorePublications,
    bulkRestoreArchived: restoreArchivedPublications,
    bulkSoftDelete: softDeletePublications,
    bulkRemove: deletePublications,
  }
})
