import { inquiriesAPI } from '@/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createWorkflowEntityStore } from './_shared/createWorkflowEntityStore'

const adapterApi = {
  list: (query) => inquiriesAPI.listInquiries(query),
  find: (id) => inquiriesAPI.findInquiry({ inquiryId: id }),
  create: (payload) => inquiriesAPI.createInquiry(payload),
  update: (id, payload) => inquiriesAPI.updateInquiry({ inquiryId: id, ...payload }),
  remove: (id) => inquiriesAPI.deleteInquiry({ inquiryId: id }),
  listPublished: (query) => inquiriesAPI.listPublishedInquiries(query),
  listArchived: (query) => inquiriesAPI.listArchivedInquiries(query),
  softDelete: (id, reason) => inquiriesAPI.softDeleteInquiry({ inquiryId: id, reason }),
  restore: (id) => inquiriesAPI.restoreInquiry({ inquiryId: id }),
  submit: (id) => inquiriesAPI.submitInquiryForApproval({ inquiryId: id }),
  approve: (id) => inquiriesAPI.approveInquiry({ inquiryId: id }),
  reject: (id, reason) => inquiriesAPI.rejectInquiry({ inquiryId: id, reason }),
  publish: (id) => inquiriesAPI.publishInquiry({ inquiryId: id }),
  unpublish: (id) => inquiriesAPI.unpublishInquiry({ inquiryId: id }),
  archive: (id, reason) => inquiriesAPI.archiveInquiry({ inquiryId: id, reason }),
  restoreArchived: (id) => inquiriesAPI.restoreArchivedInquiry({ inquiryId: id }),
}

export const useInquiriesStore = defineStore('inquiries', () => {
  const base = createWorkflowEntityStore({
    api: adapterApi,
    idField: 'inquiryId',
    entityKey: 'inquiry',
    collectionKeys: ['inquiries'],
    detailsRouteName: 'inquiries.details',
  })

  const stats = ref(null)

  async function respondToInquiry(inquiryId, response) {
    return base.withAsync(async () => {
      const res = await inquiriesAPI.respondToInquiry({ inquiryId, ...response })
      if (res?.error) base.handleError(res)
      return base.setEntityState(res?.inquiry || res)
    })
  }

  async function classifyInquiry(inquiryId, classification) {
    return base.withAsync(async () => {
      const res = await inquiriesAPI.classifyInquiry({ inquiryId, classification })
      if (res?.error) base.handleError(res)
      return base.setEntityState(res?.inquiry || res)
    })
  }

  async function categorizeInquiry(inquiryId, category) {
    return base.withAsync(async () => {
      const res = await inquiriesAPI.categorizeInquiry({ inquiryId, category })
      if (res?.error) base.handleError(res)
      return base.setEntityState(res?.inquiry || res)
    })
  }

  async function fetchStats() {
    return base.withAsync(async () => {
      const res = await inquiriesAPI.getInquiryStats()
      if (res?.error) base.handleError(res)
      stats.value = res?.stats || res
      return stats.value
    })
  }

  async function findUnprocessed(query = {}) {
    return base.withAsync(async () => {
      const res = await inquiriesAPI.findUnprocessedInquiries(query)
      if (res?.error) base.handleError(res)
      return res
    })
  }

  return {
    ...base,
    stats,
    respondToInquiry,
    classifyInquiry,
    categorizeInquiry,
    fetchStats,
    findUnprocessed,
  }
})
