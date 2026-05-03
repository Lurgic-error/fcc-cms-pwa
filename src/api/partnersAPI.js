import { unwrapApiResponsePayload, wrapApiErrorResult } from './responseEnvelope'
/**
 * Partners API - Aligned with buildMakeRoutes endpoints
 */
export default function ({ request }) {
  const url = '/partners'

  return Object.freeze({
    listPartners,
    findPartner,
    listPublishedPartners,
    listArchivedPartners,
    createPartner,
    updatePartner,
    deletePartner,
    softDeletePartner,
    restorePartner,
    submitPartnerForApproval,
    approvePartner,
    rejectPartner,
    publishPartner,
    unpublishPartner,
    archivePartner,
    restoreArchivedPartner,
  })

  async function listPartners(query = {}) {
    try {
      const { data } = await request.get(url, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function findPartner({ partnerId }) {
    try {
      const { data } = await request.get(`${url}/${partnerId}`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function listPublishedPartners(query = {}) {
    try {
      const { data } = await request.get(`${url}/published`, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function listArchivedPartners(query = {}) {
    try {
      const { data } = await request.get(`${url}/archived`, { params: query })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function createPartner({ partnerInfo }) {
    try {
      const { data } = await request.post(`${url}/create`, partnerInfo)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function updatePartner({ partnerId, ...partnerInfo }) {
    try {
      const { data } = await request.put(`${url}/${partnerId}/update`, partnerInfo)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function deletePartner({ partnerId }) {
    try {
      const { data } = await request.delete(`${url}/${partnerId}/delete`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function softDeletePartner({ partnerId, reason }) {
    try {
      const { data } = await request.put(`${url}/${partnerId}/soft-delete`, { reason })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function restorePartner({ partnerId }) {
    try {
      const { data } = await request.put(`${url}/${partnerId}/restore`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function submitPartnerForApproval({ partnerId }) {
    try {
      const { data } = await request.put(`${url}/${partnerId}/submit`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function approvePartner({ partnerId }) {
    try {
      const { data } = await request.put(`${url}/${partnerId}/approve`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function rejectPartner({ partnerId, reason }) {
    try {
      const { data } = await request.put(`${url}/${partnerId}/reject`, { reason })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function publishPartner({ partnerId }) {
    try {
      const { data } = await request.put(`${url}/${partnerId}/publish`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function unpublishPartner({ partnerId }) {
    try {
      const { data } = await request.put(`${url}/${partnerId}/unpublish`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function archivePartner({ partnerId, reason }) {
    try {
      const { data } = await request.put(`${url}/${partnerId}/archive`, { reason })
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }

  async function restoreArchivedPartner({ partnerId }) {
    try {
      const { data } = await request.put(`${url}/${partnerId}/restore-archive`)
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error)
    }
  }
}
