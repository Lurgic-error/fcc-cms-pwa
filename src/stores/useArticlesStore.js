import { articlesAPI } from '@/api'
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

export const useArticlesStore = defineStore('articles', () => {
  const router = useRouter()

  /* ==================== SHARED FOUNDATIONS ==================== */

  const { loading, error, clearError, handleError, withAsync } = useAsyncState()
  const { pagination, setPagination } = usePagination()

  const {
    entity: article,
    entities: articles,
    hasEntity: hasArticle,
    clearEntity,
  } = useEntityState()

  /* ==================== EXTRA STATE ==================== */

  const publishedArticles = ref([])
  const archivedArticles = ref([])
  const featuredArticles = ref([])
  const featureRequestedArticles = ref([])
  const approvedReadyForPublish = ref([])

  /* ==================== COMPUTED ==================== */

  const isPublished = computed(() => getEffectiveWorkflowStatus(article.value) === 'published')
  const isArchived = computed(() => getEffectiveWorkflowStatus(article.value) === 'archived')
  const isScheduled = computed(() => getEffectiveWorkflowStatus(article.value) === 'scheduled')

  /* ==================== INTERNAL HELPERS ==================== */

  function goToDetails(articleId) {
    router.push({
      name: 'articles.details',
      params: { articleId },
    })
  }

  async function refreshList(query = {}) {
    await listArticles(query)
  }

  /* ==================== READ ==================== */

  async function listArticles(query = {}) {
    return withAsync(async () => {
      const res = await articlesAPI.listArticles(query)
      if (res?.error) handleError(res)

      articles.value = withWorkflowStateList(res.items || res.articles || [])
      setPagination(res)
      return articles.value
    })
  }

  async function findArticle(articleId) {
    return withAsync(async () => {
      const res = await articlesAPI.findArticle({ articleId })
      if (res?.error) handleError(res)

      article.value = withWorkflowState(res.article || res)
      return article.value
    })
  }

  async function listPublishedArticles(query = {}) {
    return withAsync(async () => {
      const res = await articlesAPI.listPublishedArticles(query)
      if (res?.error) handleError(res)

      publishedArticles.value = withWorkflowStateList(res.items || res.articles || [])
      return publishedArticles.value
    })
  }

  async function listArchivedArticles(query = {}) {
    return withAsync(async () => {
      const res = await articlesAPI.listArchivedArticles(query)
      if (res?.error) handleError(res)

      archivedArticles.value = withWorkflowStateList(res.items || res.articles || [])
      return archivedArticles.value
    })
  }

  async function findFeaturedArticles(query = {}) {
    return withAsync(async () => {
      const res = await articlesAPI.findFeaturedArticles(query)
      if (res?.error) handleError(res)

      featuredArticles.value = withWorkflowStateList(res.items || res.articles || [])
      return featuredArticles.value
    })
  }

  async function findFeatureRequestedArticles(query = {}) {
    return withAsync(async () => {
      const res = await articlesAPI.findFeatureRequestedArticles(query)
      if (res?.error) handleError(res)

      featureRequestedArticles.value = withWorkflowStateList(res.items || res.articles || [])
      return featureRequestedArticles.value
    })
  }

  async function findApprovedReadyForPublish(query = {}) {
    return withAsync(async () => {
      const res = await articlesAPI.findApprovedReadyForPublish(query)
      if (res?.error) handleError(res)

      approvedReadyForPublish.value = withWorkflowStateList(res.items || res.articles || [])
      return approvedReadyForPublish.value
    })
  }

  /* ==================== CREATE ==================== */

  async function createArticle(articleInfo) {
    return withAsync(async () => {
      const res = await articlesAPI.createArticle({ articleInfo })
      if (res?.error) handleError(res)

      article.value = withWorkflowState(res.article || res)
      if (article.value?.articleId) goToDetails(article.value.articleId)

      return article.value
    })
  }

  async function createArticles(items) {
    return withAsync(async () => {
      const res = await articlesAPI.createArticles({ items })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  /* ==================== UPDATE ==================== */

  async function updateArticle(articleId, articleInfo) {
    return withAsync(async () => {
      const res = await articlesAPI.updateArticle({ articleId, ...articleInfo })
      if (res?.error) handleError(res)

      article.value = withWorkflowState(res.article || res)
      goToDetails(articleId)
      return article.value
    })
  }

  async function updateArticles(items) {
    return withAsync(async () => {
      const res = await articlesAPI.updateArticles({ items })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  /* ==================== DELETE ==================== */

  async function deleteArticle(articleId) {
    return withAsync(async () => {
      const res = await articlesAPI.deleteArticle({ articleId })
      if (res?.error) handleError(res)

      clearEntity()
      await refreshList()
      return res
    })
  }

  async function deleteArticles(ids) {
    return withAsync(async () => {
      const res = await articlesAPI.deleteArticles({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function softDeleteArticle(articleId, reason) {
    return withAsync(async () => {
      const res = await articlesAPI.softDeleteArticle({ articleId, reason })
      if (res?.error) handleError(res)

      article.value = withWorkflowState(res.article || res)
      return article.value
    })
  }

  async function softDeleteArticles(ids, reason) {
    return withAsync(async () => {
      const res = await articlesAPI.softDeleteArticles({ ids, reason })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  /* ==================== RESTORE ==================== */

  async function restoreArticle(articleId) {
    return withAsync(async () => {
      const res = await articlesAPI.restoreArticle({ articleId })
      if (res?.error) handleError(res)

      article.value = withWorkflowState(res.article || res)
      return article.value
    })
  }

  async function restoreArticles(ids) {
    return withAsync(async () => {
      const res = await articlesAPI.restoreArticles({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  /* ==================== WORKFLOW ==================== */

  async function submitArticleForApproval(articleId) {
    return withAsync(async () => {
      const res = await articlesAPI.submitArticleForApproval({ articleId })
      if (res?.error) handleError(res)

      article.value = withWorkflowState(res.article || res)
      return article.value
    })
  }

  async function approveArticle(articleId) {
    return withAsync(async () => {
      const res = await articlesAPI.approveArticle({ articleId })
      if (res?.error) handleError(res)

      article.value = withWorkflowState(res.article || res)
      return article.value
    })
  }

  async function rejectArticle(articleId, reason) {
    return withAsync(async () => {
      const res = await articlesAPI.rejectArticle({ articleId, reason })
      if (res?.error) handleError(res)

      article.value = withWorkflowState(res.article || res)
      return article.value
    })
  }

  async function publishArticle(articleId) {
    return withAsync(async () => {
      const res = await articlesAPI.publishArticle({ articleId })
      if (res?.error) handleError(res)

      article.value = withWorkflowState(res.article || res)
      return article.value
    })
  }

  async function unpublishArticle(articleId) {
    return withAsync(async () => {
      const res = await articlesAPI.unpublishArticle({ articleId })
      if (res?.error) handleError(res)

      article.value = withWorkflowState(res.article || res)
      return article.value
    })
  }

  async function publishArticles(ids) {
    return withAsync(async () => {
      const res = await articlesAPI.publishArticles({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function unpublishArticles(ids) {
    return withAsync(async () => {
      const res = await articlesAPI.unpublishArticles({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function scheduleArticlePublish(articleId, payload = {}) {
    return withAsync(async () => {
      const res = await articlesAPI.scheduleArticlePublish({
        articleId,
        scheduledPublishAt: payload?.scheduledPublishAt ?? payload,
        timezone: payload?.timezone,
      })
      if (res?.error) handleError(res)

      article.value = withWorkflowState(res.article || res)
      return article.value
    })
  }

  async function scheduleArticleUnpublish(articleId, payload = {}) {
    return withAsync(async () => {
      const res = await articlesAPI.scheduleArticleUnpublish({
        articleId,
        scheduledUnpublishAt: payload?.scheduledUnpublishAt ?? payload,
        timezone: payload?.timezone,
      })
      if (res?.error) handleError(res)

      article.value = withWorkflowState(res.article || res)
      return article.value
    })
  }

  async function cancelArticlePublishSchedule(articleId) {
    return withAsync(async () => {
      const res = await articlesAPI.cancelArticlePublishSchedule({ articleId })
      if (res?.error) handleError(res)

      article.value = withWorkflowState(res.article || res)
      return article.value
    })
  }

  async function cancelArticleUnpublishSchedule(articleId) {
    return withAsync(async () => {
      const res = await articlesAPI.cancelArticleUnpublishSchedule({ articleId })
      if (res?.error) handleError(res)

      article.value = withWorkflowState(res.article || res)
      return article.value
    })
  }

  async function scheduleArticlesPublish(items) {
    return withAsync(async () => {
      const res = await articlesAPI.scheduleArticlesPublish({ items })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function scheduleArticlesUnpublish(items) {
    return withAsync(async () => {
      const res = await articlesAPI.scheduleArticlesUnpublish({ items })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function cancelArticlesPublishSchedule(ids) {
    return withAsync(async () => {
      const res = await articlesAPI.cancelArticlesPublishSchedule({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function cancelArticlesUnpublishSchedule(ids) {
    return withAsync(async () => {
      const res = await articlesAPI.cancelArticlesUnpublishSchedule({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  /* ==================== SCHEDULING / ARCHIVE / MAINTENANCE ==================== */

  async function processScheduledArticles() {
    return withAsync(async () => {
      const res = await articlesAPI.processScheduledArticles()
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function archiveArticle(articleId, reason) {
    return withAsync(async () => {
      const res = await articlesAPI.archiveArticle({ articleId, reason })
      if (res?.error) handleError(res)

      article.value = withWorkflowState(res.article || res)
      return article.value
    })
  }

  async function restoreArchivedArticle(articleId) {
    return withAsync(async () => {
      const res = await articlesAPI.restoreArchivedArticle({ articleId })
      if (res?.error) handleError(res)

      article.value = withWorkflowState(res.article || res)
      return article.value
    })
  }

  async function archiveArticles(ids, reason) {
    return withAsync(async () => {
      const res = await articlesAPI.archiveArticles({ ids, reason })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function restoreArchivedArticles(ids) {
    return withAsync(async () => {
      const res = await articlesAPI.restoreArchivedArticles({ ids })
      if (res?.error) handleError(res)

      await refreshList()
      return res
    })
  }

  async function unfeatureExpiredArticles() {
    return withAsync(async () => {
      const res = await articlesAPI.unfeatureExpiredArticles()
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

    article,
    articles,
    publishedArticles,
    archivedArticles,
    featuredArticles,
    featureRequestedArticles,
    approvedReadyForPublish,

    hasArticle,
    isPublished,
    isArchived,
    isScheduled,

    listArticles,
    findArticle,
    listPublishedArticles,
    listArchivedArticles,
    findFeaturedArticles,
    findFeatureRequestedArticles,
    findApprovedReadyForPublish,

    createArticle,
    createArticles,
    updateArticle,
    updateArticles,

    deleteArticle,
    deleteArticles,
    softDeleteArticle,
    softDeleteArticles,

    restoreArticle,
    restoreArticles,

    submitArticleForApproval,
    approveArticle,
    rejectArticle,
    publishArticle,
    unpublishArticle,
    publishArticles,
    unpublishArticles,
    scheduleArticlePublish,
    scheduleArticleUnpublish,
    cancelArticlePublishSchedule,
    cancelArticleUnpublishSchedule,
    scheduleArticlesPublish,
    scheduleArticlesUnpublish,
    cancelArticlesPublishSchedule,
    cancelArticlesUnpublishSchedule,

    processScheduledArticles,

    archiveArticle,
    restoreArchivedArticle,
    archiveArticles,
    restoreArchivedArticles,

    unfeatureExpiredArticles,

    submit: submitArticleForApproval,
    submitForApproval: submitArticleForApproval,
    approve: approveArticle,
    reject: rejectArticle,
    publish: publishArticle,
    unpublish: unpublishArticle,
    schedulePublish: scheduleArticlePublish,
    scheduleUnpublish: scheduleArticleUnpublish,
    cancelPublishSchedule: cancelArticlePublishSchedule,
    cancelUnpublishSchedule: cancelArticleUnpublishSchedule,
    archive: archiveArticle,
    restoreArchived: restoreArchivedArticle,
    softDelete: softDeleteArticle,
    restore: restoreArticle,
    remove: deleteArticle,
    bulkPublish: publishArticles,
    bulkUnpublish: unpublishArticles,
    bulkSchedulePublish: scheduleArticlesPublish,
    bulkScheduleUnpublish: scheduleArticlesUnpublish,
    bulkCancelPublishSchedule: cancelArticlesPublishSchedule,
    bulkCancelUnpublishSchedule: cancelArticlesUnpublishSchedule,
    bulkArchive: archiveArticles,
    bulkRestore: restoreArticles,
    bulkRestoreArchived: restoreArchivedArticles,
    bulkSoftDelete: softDeleteArticles,
    bulkRemove: deleteArticles,
  }
})
