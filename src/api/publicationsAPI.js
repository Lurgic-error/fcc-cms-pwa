/**
 * Publications & Categories API - Aligned with buildMakeRoutes endpoints
 */
export default function ({ request }) {
  const pubURL = '/publications'
  const catURL = '/publications/categories'

  function appendFormValue(formData, key, value) {
    if (value === undefined) return
    if (value === null) {
      formData.append(key, '')
      return
    }

    if (value instanceof File) {
      formData.append(key, value)
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null || item === '') return
        if (item instanceof File) {
          formData.append(key, item)
          return
        }

        if (typeof item === 'object') {
          formData.append(key, JSON.stringify(item))
          return
        }

        formData.append(key, item)
      })
      return
    }

    if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value))
      return
    }

    formData.append(key, value)
  }

  function toPublicationFormData(payload = {}) {
    const formData = new FormData()
    const { documents = [], ...rest } = payload || {}

    Object.entries(rest).forEach(([key, value]) => {
      appendFormValue(formData, key, value)
    })

    const files = Array.isArray(documents) ? documents : documents ? [documents] : []
    files.forEach((file) => {
      if (file instanceof File) {
        formData.append('documents', file)
      }
    })

    return formData
  }

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
    /* ==================== PUBLICATIONS ==================== */
    listPublications,
    findPublication,
    listPublishedPublications,
    listArchivedPublications,
    searchPublications,
    createPublication,
    createPublications,
    updatePublication,
    updatePublications,
    deletePublication,
    deletePublications,
    softDeletePublication,
    softDeletePublications,
    restorePublication,
    restorePublications,
    submitPublicationForApproval,
    approvePublication,
    rejectPublication,
    publishPublication,
    unpublishPublication,
    publishPublications,
    unpublishPublications,
    schedulePublicationPublish,
    schedulePublicationUnpublish,
    cancelPublicationPublishSchedule,
    cancelPublicationUnpublishSchedule,
    schedulePublicationsPublish,
    schedulePublicationsUnpublish,
    cancelPublicationsPublishSchedule,
    cancelPublicationsUnpublishSchedule,
    processScheduledPublications,
    archivePublication,
    restoreArchivedPublication,
    archivePublications,
    restoreArchivedPublications,
    expirePublications,

    /* ==================== CATEGORIES ==================== */
    listPublicationCategories,
    findPublicationCategory,
    listPublishedCategories,
    listArchivedCategories,
    searchCategories,
    createPublicationCategory,
    updatePublicationCategory,
    deletePublicationCategory,
    deletePublicationCategories,
    softDeleteCategory,
    softDeleteCategories,
    restoreCategory,
    restoreCategories,
    submitPublicationCategoryForApproval,
    approvePublicationCategory,
    rejectPublicationCategory,
    publishCategory,
    unpublishCategory,
    publishCategories,
    unpublishCategories,
    schedulePublicationCategoryPublish,
    schedulePublicationCategoryUnpublish,
    cancelPublicationCategoryPublishSchedule,
    cancelPublicationCategoryUnpublishSchedule,
    schedulePublicationCategoriesPublish,
    schedulePublicationCategoriesUnpublish,
    cancelPublicationCategoriesPublishSchedule,
    cancelPublicationCategoriesUnpublishSchedule,
    archiveCategory,
    archiveCategories,
    restoreArchivedCategory,
    restoreArchivedCategories,
    publishPublicationCategory, // Special rule-enforced publish
  })

  /* ==================== PUBLICATIONS: READ ==================== */

  async function listPublications(query = {}) {
    try {
      const { data } = await request.get(pubURL, { params: query })
      return normalizeCollectionPayload(data, 'publications')
    } catch (error) {
      return { error }
    }
  }

  async function findPublication({ publicationId }) {
    try {
      const { data } = await request.get(`${pubURL}/${publicationId}`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function listPublishedPublications(query = {}) {
    try {
      const { data } = await request.get(`${pubURL}/published`, { params: query })
      return normalizeCollectionPayload(data, 'publications')
    } catch (error) {
      return { error }
    }
  }

  async function listArchivedPublications(query = {}) {
    try {
      const { data } = await request.get(`${pubURL}/archived`, { params: query })
      return normalizeCollectionPayload(data, 'publications')
    } catch (error) {
      return { error }
    }
  }

  async function searchPublications(query = {}) {
    try {
      const { data } = await request.get(`${pubURL}/search`, { params: query })
      return normalizeCollectionPayload(data, 'publications')
    } catch (error) {
      return { error }
    }
  }

  /* ==================== PUBLICATIONS: CREATE ==================== */

  async function createPublication({ publicationInfo }) {
    try {
      const { data } = await request.post(
        `${pubURL}/create`,
        toPublicationFormData(publicationInfo),
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      )
      return data
    } catch (error) {
      return { error }
    }
  }

  async function createPublications({ items }) {
    try {
      const { data } = await request.post(`${pubURL}/bulk/create`, { items })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== PUBLICATIONS: UPDATE ==================== */

  async function updatePublication({ publicationId, ...publicationInfo }) {
    try {
      const { data } = await request.put(
        `${pubURL}/${publicationId}/update`,
        toPublicationFormData(publicationInfo),
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      )
      return data
    } catch (error) {
      return { error }
    }
  }

  async function updatePublications({ items }) {
    try {
      const { data } = await request.put(`${pubURL}/bulk/update`, { items })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== PUBLICATIONS: DELETE ==================== */

  async function deletePublication({ publicationId }) {
    try {
      const { data } = await request.delete(`${pubURL}/${publicationId}/delete`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function deletePublications({ ids }) {
    try {
      const { data } = await request.delete(`${pubURL}/bulk/delete`, { data: { ids } })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function softDeletePublication({ publicationId, reason }) {
    try {
      const { data } = await request.put(`${pubURL}/${publicationId}/soft-delete`, { reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function softDeletePublications({ ids, reason }) {
    try {
      const { data } = await request.put(`${pubURL}/bulk/soft-delete`, { ids, reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function restorePublication({ publicationId }) {
    try {
      const { data } = await request.put(`${pubURL}/${publicationId}/restore`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function restorePublications({ ids }) {
    try {
      const { data } = await request.put(`${pubURL}/bulk/restore`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== PUBLICATIONS: WORKFLOW ==================== */

  async function submitPublicationForApproval({ publicationId }) {
    try {
      const { data } = await request.put(`${pubURL}/${publicationId}/submit`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function approvePublication({ publicationId }) {
    try {
      const { data } = await request.put(`${pubURL}/${publicationId}/approve`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function rejectPublication({ publicationId, reason }) {
    try {
      const { data } = await request.put(`${pubURL}/${publicationId}/reject`, { reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function publishPublication({ publicationId }) {
    try {
      const { data } = await request.put(`${pubURL}/${publicationId}/publish`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function unpublishPublication({ publicationId }) {
    try {
      const { data } = await request.put(`${pubURL}/${publicationId}/unpublish`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function publishPublications({ ids }) {
    try {
      const { data } = await request.put(`${pubURL}/bulk/publish`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function unpublishPublications({ ids }) {
    try {
      const { data } = await request.put(`${pubURL}/bulk/unpublish`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== PUBLICATIONS: SCHEDULING ==================== */

  async function schedulePublicationPublish({ publicationId, scheduledPublishAt, timezone }) {
    try {
      const { data } = await request.put(`${pubURL}/${publicationId}/schedule-publish`, {
        scheduledPublishAt,
        timezone,
      })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function schedulePublicationUnpublish({ publicationId, scheduledUnpublishAt, timezone }) {
    try {
      const { data } = await request.put(`${pubURL}/${publicationId}/schedule-unpublish`, {
        scheduledUnpublishAt,
        timezone,
      })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelPublicationPublishSchedule({ publicationId }) {
    try {
      const { data } = await request.put(`${pubURL}/${publicationId}/cancel-publish-schedule`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelPublicationUnpublishSchedule({ publicationId }) {
    try {
      const { data } = await request.put(`${pubURL}/${publicationId}/cancel-unpublish-schedule`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function schedulePublicationsPublish({ items }) {
    try {
      const { data } = await request.put(`${pubURL}/bulk/schedule-publish`, { items })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function schedulePublicationsUnpublish({ items }) {
    try {
      const { data } = await request.put(`${pubURL}/bulk/schedule-unpublish`, { items })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelPublicationsPublishSchedule({ ids }) {
    try {
      const { data } = await request.put(`${pubURL}/bulk/cancel-publish-schedule`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelPublicationsUnpublishSchedule({ ids }) {
    try {
      const { data } = await request.put(`${pubURL}/bulk/cancel-unpublish-schedule`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function processScheduledPublications() {
    try {
      const { data } = await request.post(`${pubURL}/process-scheduled`)
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== PUBLICATIONS: ARCHIVING ==================== */

  async function archivePublication({ publicationId, reason }) {
    try {
      const { data } = await request.put(`${pubURL}/${publicationId}/archive`, { reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function restoreArchivedPublication({ publicationId }) {
    try {
      const { data } = await request.put(`${pubURL}/${publicationId}/restore-archive`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function archivePublications({ ids, reason }) {
    try {
      const { data } = await request.put(`${pubURL}/bulk/archive`, { ids, reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function restoreArchivedPublications({ ids }) {
    try {
      const { data } = await request.put(`${pubURL}/bulk/restore-archive`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== PUBLICATIONS: MAINTENANCE ==================== */

  async function expirePublications() {
    try {
      const { data } = await request.post(`${pubURL}/maintenance/expire`)
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== CATEGORIES: READ ==================== */

  async function listPublicationCategories(query = {}) {
    try {
      const { data } = await request.get(catURL, { params: query })
      return normalizeCollectionPayload(data, 'categories')
    } catch (error) {
      return { error }
    }
  }

  async function findPublicationCategory({ categoryId }) {
    try {
      const { data } = await request.get(`${catURL}/${categoryId}`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function listPublishedCategories(query = {}) {
    try {
      const { data } = await request.get(`${catURL}/published`, { params: query })
      return normalizeCollectionPayload(data, 'categories')
    } catch (error) {
      return { error }
    }
  }

  async function listArchivedCategories(query = {}) {
    try {
      const { data } = await request.get(`${catURL}/archived`, { params: query })
      return normalizeCollectionPayload(data, 'categories')
    } catch (error) {
      return { error }
    }
  }

  async function searchCategories(query = {}) {
    try {
      const { data } = await request.get(`${catURL}/search`, { params: query })
      return normalizeCollectionPayload(data, 'categories')
    } catch (error) {
      return { error }
    }
  }

  /* ==================== CATEGORIES: CREATE/UPDATE/DELETE ==================== */

  async function createPublicationCategory(categoryInfo) {
    try {
      const { data } = await request.post(`${catURL}/create`, categoryInfo)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function updatePublicationCategory({ categoryId, ...categoryInfo }) {
    try {
      const { data } = await request.put(`${catURL}/${categoryId}/update`, categoryInfo)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function deletePublicationCategory({ categoryId }) {
    try {
      const { data } = await request.delete(`${catURL}/${categoryId}/delete`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function deletePublicationCategories({ ids }) {
    try {
      const { data } = await request.delete(`${catURL}/bulk/delete`, { data: { ids } })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function softDeleteCategory({ categoryId, reason }) {
    try {
      const { data } = await request.put(`${catURL}/${categoryId}/soft-delete`, { reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function softDeleteCategories({ ids, reason }) {
    try {
      const { data } = await request.put(`${catURL}/bulk/soft-delete`, { ids, reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function restoreCategory({ categoryId }) {
    try {
      const { data } = await request.put(`${catURL}/${categoryId}/restore`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function restoreCategories({ ids }) {
    try {
      const { data } = await request.put(`${catURL}/bulk/restore`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== CATEGORIES: WORKFLOW ==================== */

  async function submitPublicationCategoryForApproval({ categoryId }) {
    try {
      const { data } = await request.put(`${catURL}/${categoryId}/submit`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function approvePublicationCategory({ categoryId }) {
    try {
      const { data } = await request.put(`${catURL}/${categoryId}/approve`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function rejectPublicationCategory({ categoryId, reason }) {
    try {
      const { data } = await request.put(`${catURL}/${categoryId}/reject`, { reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function publishCategory({ categoryId }) {
    try {
      const { data } = await request.put(`${catURL}/${categoryId}/publish`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function unpublishCategory({ categoryId }) {
    try {
      const { data } = await request.put(`${catURL}/${categoryId}/unpublish`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function publishCategories({ ids }) {
    try {
      const { data } = await request.put(`${catURL}/bulk/publish`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function unpublishCategories({ ids }) {
    try {
      const { data } = await request.put(`${catURL}/bulk/unpublish`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function archiveCategory({ categoryId, reason }) {
    try {
      const { data } = await request.put(`${catURL}/${categoryId}/archive`, { reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function restoreArchivedCategory({ categoryId }) {
    try {
      const { data } = await request.put(`${catURL}/${categoryId}/restore-archive`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function archiveCategories({ ids, reason }) {
    try {
      const { data } = await request.put(`${catURL}/bulk/archive`, { ids, reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function restoreArchivedCategories({ ids }) {
    try {
      const { data } = await request.put(`${catURL}/bulk/restore-archive`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  // Special rule-enforced publish
  async function publishPublicationCategory({ categoryId }) {
    try {
      const { data } = await request.put(`${catURL}/${categoryId}/publish-category`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function schedulePublicationCategoryPublish({ categoryId, scheduledPublishAt, timezone }) {
    try {
      const { data } = await request.put(`${catURL}/${categoryId}/schedule-publish`, {
        scheduledPublishAt,
        timezone,
      })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function schedulePublicationCategoryUnpublish({
    categoryId,
    scheduledUnpublishAt,
    timezone,
  }) {
    try {
      const { data } = await request.put(`${catURL}/${categoryId}/schedule-unpublish`, {
        scheduledUnpublishAt,
        timezone,
      })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function schedulePublicationCategoriesPublish({ items }) {
    try {
      const { data } = await request.put(`${catURL}/bulk/schedule-publish`, { items })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function schedulePublicationCategoriesUnpublish({ items }) {
    try {
      const { data } = await request.put(`${catURL}/bulk/schedule-unpublish`, { items })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelPublicationCategoryPublishSchedule({ categoryId }) {
    try {
      const { data } = await request.put(`${catURL}/${categoryId}/cancel-publish-schedule`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelPublicationCategoriesPublishSchedule({ ids }) {
    try {
      const { data } = await request.put(`${catURL}/bulk/cancel-publish-schedule`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelPublicationCategoryUnpublishSchedule({ categoryId }) {
    try {
      const { data } = await request.put(`${catURL}/${categoryId}/cancel-unpublish-schedule`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelPublicationCategoriesUnpublishSchedule({ ids }) {
    try {
      const { data } = await request.put(`${catURL}/bulk/cancel-unpublish-schedule`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }
}
