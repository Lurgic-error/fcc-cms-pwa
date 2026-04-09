import { publicationsAPI } from '@/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useAsyncState } from '@/stores/_shared/useAsyncState'
import { useEntityState } from '@/stores/_shared/useEntityState'
import { usePagination } from '@/stores/_shared/usePagination'
import {
  getEffectiveWorkflowStatus,
  withWorkflowState,
  withWorkflowStateList,
} from '@/utils/contentWorkflow'

export const usePublicationCategoriesStore = defineStore('publicationCategories', () => {
  /* ==================== SHARED FOUNDATIONS ==================== */

  const { loading, error, clearError, handleError, withAsync } = useAsyncState()
  const { pagination, setPagination } = usePagination()

  const {
    entity: category,
    entities: categories,
    hasEntity: hasCategory,
    clearEntity,
  } = useEntityState()

  /* ==================== EXTRA STATE ==================== */

  const publishedCategories = ref([])
  const archivedCategories = ref([])

  /* ==================== COMPUTED ==================== */

  const isPublished = computed(() => getEffectiveWorkflowStatus(category.value) === 'published')
  const isArchived = computed(() => getEffectiveWorkflowStatus(category.value) === 'archived')
  const isScheduled = computed(() => getEffectiveWorkflowStatus(category.value) === 'scheduled')

  /* ==================== READ ==================== */

  async function listCategories(query = {}) {
    return withAsync(async () => {
      const res = await publicationsAPI.listPublicationCategories(query)
      if (res?.error) handleError(res)

      categories.value = withWorkflowStateList(res.items || res.categories || [])
      setPagination(res)
      return categories.value
    })
  }

  async function findCategory(categoryId) {
    return withAsync(async () => {
      const res = await publicationsAPI.findPublicationCategory({ categoryId })
      if (res?.error) handleError(res)

      category.value = withWorkflowState(res.category || res)
      return category.value
    })
  }

  async function listPublishedCategories(query = {}) {
    return withAsync(async () => {
      const res = await publicationsAPI.listPublishedCategories(query)
      if (res?.error) handleError(res)

      publishedCategories.value = withWorkflowStateList(res.items || res.categories || [])
      setPagination(res)
      return publishedCategories.value
    })
  }

  async function listArchivedCategories(query = {}) {
    return withAsync(async () => {
      const res = await publicationsAPI.listArchivedCategories(query)
      if (res?.error) handleError(res)

      archivedCategories.value = withWorkflowStateList(res.items || res.categories || [])
      setPagination(res)
      return archivedCategories.value
    })
  }

  async function searchCategories(query = {}) {
    return withAsync(async () => {
      const res = await publicationsAPI.searchCategories(query)
      if (res?.error) handleError(res)

      categories.value = withWorkflowStateList(res.items || res.categories || [])
      setPagination(res)
      return categories.value
    })
  }

  /* ==================== CREATE / UPDATE ==================== */

  async function createCategory(categoryInfo) {
    return withAsync(async () => {
      const res = await publicationsAPI.createPublicationCategory(categoryInfo)
      if (res?.error) handleError(res)

      category.value = withWorkflowState(res.category || res)
      return category.value
    })
  }

  async function updateCategory(categoryId, categoryInfo) {
    return withAsync(async () => {
      const res = await publicationsAPI.updatePublicationCategory({
        categoryId,
        ...categoryInfo,
      })
      if (res?.error) handleError(res)

      category.value = withWorkflowState(res.category || res)
      return category.value
    })
  }

  /* ==================== DELETE ==================== */

  async function deleteCategory(categoryId) {
    return withAsync(async () => {
      const res = await publicationsAPI.deletePublicationCategory({ categoryId })
      if (res?.error) handleError(res)

      clearEntity()
      await listCategories()
      return res
    })
  }

  async function softDeleteCategory(categoryId, reason) {
    return withAsync(async () => {
      const res = await publicationsAPI.softDeleteCategory({ categoryId, reason })
      if (res?.error) handleError(res)

      category.value = withWorkflowState(res.category || res)
      return category.value
    })
  }

  /* ==================== RESTORE ==================== */

  async function restoreCategory(categoryId) {
    return withAsync(async () => {
      const res = await publicationsAPI.restoreCategory({ categoryId })
      if (res?.error) handleError(res)

      category.value = withWorkflowState(res.category || res)
      return category.value
    })
  }

  async function restoreArchivedCategory(categoryId) {
    return withAsync(async () => {
      const res = await publicationsAPI.restoreArchivedCategory({ categoryId })
      if (res?.error) handleError(res)

      category.value = withWorkflowState(res.category || res)
      return category.value
    })
  }

  async function restoreCategories(ids = []) {
    return withAsync(async () => {
      const res = await publicationsAPI.restoreCategories({ ids })
      if (res?.error) handleError(res)

      await listCategories()
      return res
    })
  }

  async function restoreArchivedCategories(ids = []) {
    return withAsync(async () => {
      const res = await publicationsAPI.restoreArchivedCategories({ ids })
      if (res?.error) handleError(res)

      await listCategories()
      return res
    })
  }

  /* ==================== WORKFLOW ==================== */

  async function submitCategory(categoryId) {
    return withAsync(async () => {
      const res = await publicationsAPI.submitPublicationCategoryForApproval({ categoryId })
      if (res?.error) handleError(res)

      category.value = withWorkflowState(res.category || res)
      return category.value
    })
  }

  async function approveCategory(categoryId) {
    return withAsync(async () => {
      const res = await publicationsAPI.approvePublicationCategory({ categoryId })
      if (res?.error) handleError(res)

      category.value = withWorkflowState(res.category || res)
      return category.value
    })
  }

  async function rejectCategory(categoryId, reason) {
    return withAsync(async () => {
      const res = await publicationsAPI.rejectPublicationCategory({ categoryId, reason })
      if (res?.error) handleError(res)

      category.value = withWorkflowState(res.category || res)
      return category.value
    })
  }

  async function publishCategory(categoryId) {
    return withAsync(async () => {
      const res = await publicationsAPI.publishCategory({ categoryId })
      if (res?.error) handleError(res)

      category.value = withWorkflowState(res.category || res)
      return category.value
    })
  }

  async function unpublishCategory(categoryId) {
    return withAsync(async () => {
      const res = await publicationsAPI.unpublishCategory({ categoryId })
      if (res?.error) handleError(res)

      category.value = withWorkflowState(res.category || res)
      return category.value
    })
  }

  async function schedulePublishCategory(categoryId, payload = {}) {
    return withAsync(async () => {
      const res = await publicationsAPI.schedulePublicationCategoryPublish({
        categoryId,
        ...payload,
      })
      if (res?.error) handleError(res)

      category.value = withWorkflowState(res.category || res)
      return category.value
    })
  }

  async function scheduleUnpublishCategory(categoryId, payload = {}) {
    return withAsync(async () => {
      const res = await publicationsAPI.schedulePublicationCategoryUnpublish({
        categoryId,
        ...payload,
      })
      if (res?.error) handleError(res)

      category.value = withWorkflowState(res.category || res)
      return category.value
    })
  }

  async function cancelPublishSchedule(categoryId) {
    return withAsync(async () => {
      const res = await publicationsAPI.cancelPublicationCategoryPublishSchedule({ categoryId })
      if (res?.error) handleError(res)

      category.value = withWorkflowState(res.category || res)
      return category.value
    })
  }

  async function cancelUnpublishSchedule(categoryId) {
    return withAsync(async () => {
      const res = await publicationsAPI.cancelPublicationCategoryUnpublishSchedule({ categoryId })
      if (res?.error) handleError(res)

      category.value = withWorkflowState(res.category || res)
      return category.value
    })
  }

  async function publishCategories(ids = []) {
    return withAsync(async () => {
      const res = await publicationsAPI.publishCategories({ ids })
      if (res?.error) handleError(res)

      await listCategories()
      return res
    })
  }

  async function unpublishCategories(ids = []) {
    return withAsync(async () => {
      const res = await publicationsAPI.unpublishCategories({ ids })
      if (res?.error) handleError(res)

      await listCategories()
      return res
    })
  }

  async function schedulePublishCategories(items = []) {
    return withAsync(async () => {
      const res = await publicationsAPI.schedulePublicationCategoriesPublish({ items })
      if (res?.error) handleError(res)

      await listCategories()
      return res
    })
  }

  async function scheduleUnpublishCategories(items = []) {
    return withAsync(async () => {
      const res = await publicationsAPI.schedulePublicationCategoriesUnpublish({ items })
      if (res?.error) handleError(res)

      await listCategories()
      return res
    })
  }

  async function cancelPublishSchedules(ids = []) {
    return withAsync(async () => {
      const res = await publicationsAPI.cancelPublicationCategoriesPublishSchedule({ ids })
      if (res?.error) handleError(res)

      await listCategories()
      return res
    })
  }

  async function cancelUnpublishSchedules(ids = []) {
    return withAsync(async () => {
      const res = await publicationsAPI.cancelPublicationCategoriesUnpublishSchedule({ ids })
      if (res?.error) handleError(res)

      await listCategories()
      return res
    })
  }

  /* ==================== ARCHIVE ==================== */

  async function archiveCategory(categoryId, reason) {
    return withAsync(async () => {
      const res = await publicationsAPI.archiveCategory({ categoryId, reason })
      if (res?.error) handleError(res)

      category.value = withWorkflowState(res.category || res)
      return category.value
    })
  }

  async function archiveCategories(ids = [], reason = '') {
    return withAsync(async () => {
      const res = await publicationsAPI.archiveCategories({ ids, reason })
      if (res?.error) handleError(res)

      await listCategories()
      return res
    })
  }

  async function softDeleteCategories(ids = [], reason = '') {
    return withAsync(async () => {
      const res = await publicationsAPI.softDeleteCategories({ ids, reason })
      if (res?.error) handleError(res)

      await listCategories()
      return res
    })
  }

  async function deleteCategories(ids = []) {
    return withAsync(async () => {
      const res = await publicationsAPI.deletePublicationCategories({ ids })
      if (res?.error) handleError(res)

      await listCategories()
      return res
    })
  }

  /* ==================== EXPORT ==================== */

  return {
    // Async
    loading,
    error,
    clearError,

    // State
    pagination,
    category,
    categories,
    publishedCategories,
    archivedCategories,

    // Computed
    hasCategory,
    isPublished,
    isArchived,
    isScheduled,

    // Read
    listCategories,
    findCategory,
    listPublishedCategories,
    listArchivedCategories,
    searchCategories,

    // Write
    createCategory,
    updateCategory,

    // Delete / Restore
    deleteCategory,
    deleteCategories,
    softDeleteCategory,
    softDeleteCategories,
    restoreCategory,
    restoreCategories,
    restoreArchivedCategory,
    restoreArchivedCategories,

    // Workflow / Archive
    submitCategory,
    approveCategory,
    rejectCategory,
    publishCategory,
    publishCategories,
    unpublishCategory,
    unpublishCategories,
    schedulePublishCategory,
    scheduleUnpublishCategory,
    schedulePublishCategories,
    scheduleUnpublishCategories,
    cancelPublishSchedule,
    cancelUnpublishSchedule,
    cancelPublishSchedules,
    cancelUnpublishSchedules,
    archiveCategory,
    archiveCategories,

    // Generic workflow aliases
    submit: submitCategory,
    submitForApproval: submitCategory,
    approve: approveCategory,
    reject: rejectCategory,
    publish: publishCategory,
    unpublish: unpublishCategory,
    schedulePublish: schedulePublishCategory,
    scheduleUnpublish: scheduleUnpublishCategory,
    archive: archiveCategory,
    restoreArchived: restoreArchivedCategory,
    softDelete: softDeleteCategory,
    restore: restoreCategory,
    remove: deleteCategory,
    bulkPublish: publishCategories,
    bulkUnpublish: unpublishCategories,
    bulkSchedulePublish: schedulePublishCategories,
    bulkScheduleUnpublish: scheduleUnpublishCategories,
    bulkCancelPublishSchedule: cancelPublishSchedules,
    bulkCancelUnpublishSchedule: cancelUnpublishSchedules,
    bulkArchive: archiveCategories,
    bulkRestore: restoreCategories,
    bulkRestoreArchived: restoreArchivedCategories,
    bulkSoftDelete: softDeleteCategories,
    bulkRemove: deleteCategories,
  }
})
