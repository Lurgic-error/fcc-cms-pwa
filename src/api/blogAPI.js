import { buildMultipartPayload, hasBinaryValue } from './editorialEntityApi'

/**
 * Articles API - Aligned with buildMakeRoutes endpoints
 * Supports full editorial workflow with scheduling and bulk operations
 */
export default function ({ request }) {
  const url = '/articles'

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
    listArticles,
    findArticle,
    listPublishedArticles,
    listArchivedArticles,
    findFeaturedArticles,
    findFeatureRequestedArticles,
    findApprovedReadyForPublish,

    /* ==================== CREATE OPERATIONS ==================== */
    createArticle,
    createArticles, // Bulk

    /* ==================== UPDATE OPERATIONS ==================== */
    updateArticle,
    updateArticles, // Bulk

    /* ==================== DELETE OPERATIONS ==================== */
    deleteArticle,
    deleteArticles, // Bulk
    softDeleteArticle,
    softDeleteArticles, // Bulk

    /* ==================== RESTORE OPERATIONS ==================== */
    restoreArticle,
    restoreArticles, // Bulk

    /* ==================== PUBLICATION WORKFLOW ==================== */
    submitArticleForApproval,
    approveArticle,
    rejectArticle,
    publishArticle,
    unpublishArticle,
    publishArticles, // Bulk
    unpublishArticles, // Bulk

    /* ==================== SCHEDULING ==================== */
    scheduleArticlePublish,
    scheduleArticleUnpublish,
    cancelArticlePublishSchedule,
    cancelArticleUnpublishSchedule,
    scheduleArticlesPublish, // Bulk
    scheduleArticlesUnpublish, // Bulk
    cancelArticlesPublishSchedule, // Bulk
    cancelArticlesUnpublishSchedule, // Bulk
    processScheduledArticles,

    /* ==================== ARCHIVING ==================== */
    archiveArticle,
    restoreArchivedArticle,
    archiveArticles, // Bulk
    restoreArchivedArticles, // Bulk

    /* ==================== MAINTENANCE ==================== */
    unfeatureExpiredArticles,
  })

  /* ==================== READ OPERATIONS ==================== */

  async function listArticles(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return normalizeCollectionPayload(data, 'articles')
    } catch (error) {
      return { error }
    }
  }

  async function findArticle({ articleId }) {
    try {
      const { data } = await request.get(`${url}/${articleId}`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function listPublishedArticles(query = {}) {
    try {
      const { data } = await request.get(`${url}/published`, { params: query })
      return normalizeCollectionPayload(data, 'articles')
    } catch (error) {
      return { error }
    }
  }

  async function listArchivedArticles(query = {}) {
    try {
      const { data } = await request.get(`${url}/archived`, { params: query })
      return normalizeCollectionPayload(data, 'articles')
    } catch (error) {
      return { error }
    }
  }

  async function findFeaturedArticles(query = {}) {
    try {
      const { data } = await request.get(`${url}/featured`, { params: query })
      return normalizeCollectionPayload(data, 'articles')
    } catch (error) {
      return { error }
    }
  }

  async function findFeatureRequestedArticles(query = {}) {
    try {
      const { data } = await request.get(`${url}/feature-requests`, { params: query })
      return normalizeCollectionPayload(data, 'articles')
    } catch (error) {
      return { error }
    }
  }

  async function findApprovedReadyForPublish(query = {}) {
    try {
      const { data } = await request.get(`${url}/approved-ready`, { params: query })
      return normalizeCollectionPayload(data, 'articles')
    } catch (error) {
      return { error }
    }
  }

  /* ==================== CREATE OPERATIONS ==================== */

  async function createArticle({ articleInfo }) {
    const body = articleInfo || {}
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

  async function createArticles({ items }) {
    try {
      const { data } = await request.post(`${url}/bulk/create`, { items })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== UPDATE OPERATIONS ==================== */

  async function updateArticle({ articleId, ...articleInfo }) {
    const requestBody = hasBinaryValue(articleInfo)
      ? buildMultipartPayload(articleInfo)
      : articleInfo
    try {
      const { data } = await request.put(`${url}/${articleId}/update`, requestBody, {
        headers: hasBinaryValue(articleInfo)
          ? { 'Content-Type': 'multipart/form-data' }
          : undefined,
      })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function updateArticles({ items }) {
    try {
      const { data } = await request.put(`${url}/bulk/update`, { items })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== DELETE OPERATIONS ==================== */

  async function deleteArticle({ articleId }) {
    try {
      const { data } = await request.delete(`${url}/${articleId}/delete`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function deleteArticles({ ids }) {
    try {
      const { data } = await request.delete(`${url}/bulk/delete`, { data: { ids } })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function softDeleteArticle({ articleId, reason }) {
    try {
      const { data } = await request.put(`${url}/${articleId}/soft-delete`, { reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function softDeleteArticles({ ids, reason }) {
    try {
      const { data } = await request.put(`${url}/bulk/soft-delete`, { ids, reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== RESTORE OPERATIONS ==================== */

  async function restoreArticle({ articleId }) {
    try {
      const { data } = await request.put(`${url}/${articleId}/restore`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function restoreArticles({ ids }) {
    try {
      const { data } = await request.put(`${url}/bulk/restore`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== PUBLICATION WORKFLOW ==================== */

  async function submitArticleForApproval({ articleId }) {
    try {
      const { data } = await request.put(`${url}/${articleId}/submit`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function approveArticle({ articleId }) {
    try {
      const { data } = await request.put(`${url}/${articleId}/approve`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function rejectArticle({ articleId, reason }) {
    try {
      const { data } = await request.put(`${url}/${articleId}/reject`, { reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function publishArticle({ articleId }) {
    try {
      const { data } = await request.put(`${url}/${articleId}/publish`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function unpublishArticle({ articleId }) {
    try {
      const { data } = await request.put(`${url}/${articleId}/unpublish`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function publishArticles({ ids }) {
    try {
      const { data } = await request.put(`${url}/bulk/publish`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function unpublishArticles({ ids }) {
    try {
      const { data } = await request.put(`${url}/bulk/unpublish`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== SCHEDULING ==================== */

  async function scheduleArticlePublish({ articleId, scheduledPublishAt, timezone }) {
    try {
      const { data } = await request.put(`${url}/${articleId}/schedule-publish`, {
        scheduledPublishAt,
        timezone,
      })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function scheduleArticleUnpublish({ articleId, scheduledUnpublishAt, timezone }) {
    try {
      const { data } = await request.put(`${url}/${articleId}/schedule-unpublish`, {
        scheduledUnpublishAt,
        timezone,
      })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelArticlePublishSchedule({ articleId }) {
    try {
      const { data } = await request.put(`${url}/${articleId}/cancel-publish-schedule`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelArticleUnpublishSchedule({ articleId }) {
    try {
      const { data } = await request.put(`${url}/${articleId}/cancel-unpublish-schedule`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function scheduleArticlesPublish({ items }) {
    try {
      const { data } = await request.put(`${url}/bulk/schedule-publish`, { items })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function scheduleArticlesUnpublish({ items }) {
    try {
      const { data } = await request.put(`${url}/bulk/schedule-unpublish`, { items })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelArticlesPublishSchedule({ ids }) {
    try {
      const { data } = await request.put(`${url}/bulk/cancel-publish-schedule`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelArticlesUnpublishSchedule({ ids }) {
    try {
      const { data } = await request.put(`${url}/bulk/cancel-unpublish-schedule`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function processScheduledArticles() {
    try {
      const { data } = await request.post(`${url}/process-scheduled`)
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== ARCHIVING ==================== */

  async function archiveArticle({ articleId, reason }) {
    try {
      const { data } = await request.put(`${url}/${articleId}/archive`, { reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function restoreArchivedArticle({ articleId }) {
    try {
      const { data } = await request.put(`${url}/${articleId}/restore-archive`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function archiveArticles({ ids, reason }) {
    try {
      const { data } = await request.put(`${url}/bulk/archive`, { ids, reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function restoreArchivedArticles({ ids }) {
    try {
      const { data } = await request.put(`${url}/bulk/restore-archive`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== MAINTENANCE ==================== */

  async function unfeatureExpiredArticles() {
    try {
      const { data } = await request.post(`${url}/maintenance/unfeature-expired`)
      return data
    } catch (error) {
      return { error }
    }
  }
}
