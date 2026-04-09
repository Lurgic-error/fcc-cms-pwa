/**
 * Inquiries API - Aligned with buildMakeRoutes endpoints
 */
export default function ({ request }) {
  const url = '/inquiries'

  return Object.freeze({
    /* ==================== READ OPERATIONS ==================== */
    listInquiries,
    findInquiry,
    listPublishedInquiries,
    listArchivedInquiries,
    findUnprocessedInquiries,
    findDuplicateInquiries,
    getInquiryStats,

    /* ==================== CREATE OPERATIONS ==================== */
    createInquiry,
    createInquiries, // Bulk

    /* ==================== UPDATE OPERATIONS ==================== */
    updateInquiry,
    updateInquiries, // Bulk
    respondToInquiry,
    classifyInquiry,
    categorizeInquiry,

    /* ==================== DELETE OPERATIONS ==================== */
    deleteInquiry,
    deleteInquiries, // Bulk
    softDeleteInquiry,
    softDeleteInquiries, // Bulk

    /* ==================== RESTORE OPERATIONS ==================== */
    restoreInquiry,
    restoreInquiries, // Bulk

    /* ==================== PUBLICATION WORKFLOW ==================== */
    submitInquiryForApproval,
    approveInquiry,
    rejectInquiry,
    publishInquiry,
    unpublishInquiry,
    publishInquiries, // Bulk
    unpublishInquiries, // Bulk

    /* ==================== SCHEDULING ==================== */
    scheduleInquiryPublish,
    scheduleInquiryUnpublish,
    cancelInquiryPublishSchedule,
    cancelInquiryUnpublishSchedule,
    scheduleInquiriesPublish, // Bulk
    scheduleInquiriesUnpublish, // Bulk
    cancelInquiriesPublishSchedule, // Bulk
    cancelInquiriesUnpublishSchedule, // Bulk
    processScheduledInquiries,

    /* ==================== ARCHIVING ==================== */
    archiveInquiry,
    restoreArchivedInquiry,
    archiveInquiries, // Bulk
    restoreArchivedInquiries, // Bulk

    /* ==================== MAINTENANCE ==================== */
    sendUnprocessedAlerts,
  })

  /* ==================== READ OPERATIONS ==================== */

  async function listInquiries(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function findInquiry({ inquiryId }) {
    try {
      const { data } = await request.get(`${url}/${inquiryId}`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function listPublishedInquiries(query = {}) {
    try {
      const { data } = await request.get(`${url}/published`, { params: query })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function listArchivedInquiries(query = {}) {
    try {
      const { data } = await request.get(`${url}/archived`, { params: query })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function findUnprocessedInquiries(query = {}) {
    try {
      const { data } = await request.get(`${url}/maintenance/unprocessed`, { params: query })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function findDuplicateInquiries(query = {}) {
    try {
      const { data } = await request.get(`${url}/maintenance/duplicates`, { params: query })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function getInquiryStats() {
    try {
      const { data } = await request.get(`${url}/maintenance/stats`)
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== CREATE OPERATIONS ==================== */

  async function createInquiry(inquiryInfo) {
    try {
      const { data } = await request.post(`${url}/create`, inquiryInfo)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function createInquiries({ items }) {
    try {
      const { data } = await request.post(`${url}/bulk/create`, { items })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== UPDATE OPERATIONS ==================== */

  async function updateInquiry({ inquiryId, ...inquiryInfo }) {
    try {
      const { data } = await request.put(`${url}/${inquiryId}/update`, inquiryInfo)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function updateInquiries({ items }) {
    try {
      const { data } = await request.put(`${url}/bulk/update`, { items })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function respondToInquiry({ inquiryId, ...response }) {
    try {
      const { data } = await request.post(`${url}/${inquiryId}/respond`, response)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function classifyInquiry({ inquiryId, classification }) {
    try {
      const { data } = await request.put(`${url}/${inquiryId}/classify`, { classification })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function categorizeInquiry({ inquiryId, category }) {
    try {
      const { data } = await request.put(`${url}/${inquiryId}/categorize`, { category })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== DELETE OPERATIONS ==================== */

  async function deleteInquiry({ inquiryId }) {
    try {
      const { data } = await request.delete(`${url}/${inquiryId}/delete`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function deleteInquiries({ ids }) {
    try {
      const { data } = await request.delete(`${url}/bulk/delete`, { data: { ids } })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function softDeleteInquiry({ inquiryId, reason }) {
    try {
      const { data } = await request.put(`${url}/${inquiryId}/soft-delete`, { reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function softDeleteInquiries({ ids, reason }) {
    try {
      const { data } = await request.put(`${url}/bulk/soft-delete`, { ids, reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== RESTORE OPERATIONS ==================== */

  async function restoreInquiry({ inquiryId }) {
    try {
      const { data } = await request.put(`${url}/${inquiryId}/restore`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function restoreInquiries({ ids }) {
    try {
      const { data } = await request.put(`${url}/bulk/restore`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== PUBLICATION WORKFLOW ==================== */

  async function submitInquiryForApproval({ inquiryId }) {
    try {
      const { data } = await request.put(`${url}/${inquiryId}/submit`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function approveInquiry({ inquiryId }) {
    try {
      const { data } = await request.put(`${url}/${inquiryId}/approve`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function rejectInquiry({ inquiryId, reason }) {
    try {
      const { data } = await request.put(`${url}/${inquiryId}/reject`, { reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function publishInquiry({ inquiryId }) {
    try {
      const { data } = await request.put(`${url}/${inquiryId}/publish`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function unpublishInquiry({ inquiryId }) {
    try {
      const { data } = await request.put(`${url}/${inquiryId}/unpublish`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function publishInquiries({ ids }) {
    try {
      const { data } = await request.put(`${url}/bulk/publish`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function unpublishInquiries({ ids }) {
    try {
      const { data } = await request.put(`${url}/bulk/unpublish`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== SCHEDULING ==================== */

  async function scheduleInquiryPublish({ inquiryId, scheduledPublishAt }) {
    try {
      const { data } = await request.put(`${url}/${inquiryId}/schedule-publish`, {
        scheduledPublishAt,
      })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function scheduleInquiryUnpublish({ inquiryId, scheduledUnpublishAt }) {
    try {
      const { data } = await request.put(`${url}/${inquiryId}/schedule-unpublish`, {
        scheduledUnpublishAt,
      })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelInquiryPublishSchedule({ inquiryId }) {
    try {
      const { data } = await request.put(`${url}/${inquiryId}/cancel-publish-schedule`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelInquiryUnpublishSchedule({ inquiryId }) {
    try {
      const { data } = await request.put(`${url}/${inquiryId}/cancel-unpublish-schedule`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function scheduleInquiriesPublish({ items }) {
    try {
      const { data } = await request.put(`${url}/bulk/schedule-publish`, { items })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function scheduleInquiriesUnpublish({ items }) {
    try {
      const { data } = await request.put(`${url}/bulk/schedule-unpublish`, { items })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelInquiriesPublishSchedule({ ids }) {
    try {
      const { data } = await request.put(`${url}/bulk/cancel-publish-schedule`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function cancelInquiriesUnpublishSchedule({ ids }) {
    try {
      const { data } = await request.put(`${url}/bulk/cancel-unpublish-schedule`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function processScheduledInquiries() {
    try {
      const { data } = await request.post(`${url}/process-scheduled`)
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== ARCHIVING ==================== */

  async function archiveInquiry({ inquiryId, reason }) {
    try {
      const { data } = await request.put(`${url}/${inquiryId}/archive`, { reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function restoreArchivedInquiry({ inquiryId }) {
    try {
      const { data } = await request.put(`${url}/${inquiryId}/restore-archive`)
      return data
    } catch (error) {
      return { error }
    }
  }

  async function archiveInquiries({ ids, reason }) {
    try {
      const { data } = await request.put(`${url}/bulk/archive`, { ids, reason })
      return data
    } catch (error) {
      return { error }
    }
  }

  async function restoreArchivedInquiries({ ids }) {
    try {
      const { data } = await request.put(`${url}/bulk/restore-archive`, { ids })
      return data
    } catch (error) {
      return { error }
    }
  }

  /* ==================== MAINTENANCE ==================== */

  async function sendUnprocessedAlerts() {
    try {
      const { data } = await request.post(`${url}/maintenance/send-alerts`)
      return data
    } catch (error) {
      return { error }
    }
  }
}
