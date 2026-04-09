import { commissionAPI } from '@/api'
import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

import { useAsyncState } from '@/stores/_shared/useAsyncState'

function resolveCommissionResponse(response) {
  return response?.commission || response || null
}

export const useCommissionStore = defineStore('commission', () => {
  const { loading, error, clearError, withAsync } = useAsyncState()
  const commission = ref(null)
  const management = ref(null)
  const savingSections = reactive({})

  function setCommission(payload = null) {
    commission.value = payload
  }

  function isSavingSection(sectionKey) {
    return Boolean(savingSections[sectionKey])
  }

  function applyCommissionResponse(response) {
    const nextCommission = resolveCommissionResponse(response)
    commission.value = nextCommission
    return nextCommission
  }

  async function fetchCommission() {
    return withAsync(async () => {
      const response = await commissionAPI.fetchCommission()
      if (response?.error) throw new Error(response.error)
      commission.value = resolveCommissionResponse(response)
      return commission.value
    })
  }

  async function fetchManagement() {
    return withAsync(async () => {
      const response = await commissionAPI.fetchCommissionManagement()
      if (response?.error) throw new Error(response.error)
      management.value = response?.management || response || null
      return management.value
    })
  }

  async function saveSection(sectionKey, payload = {}) {
    clearError()
    savingSections[sectionKey] = true

    try {
      const response = await commissionAPI.updateCommission(payload)
      if (response?.error) throw new Error(response.error)
      commission.value = resolveCommissionResponse(response)
      return commission.value
    } catch (err) {
      error.value = err?.message || 'Unable to save commission section.'
      throw err
    } finally {
      savingSections[sectionKey] = false
    }
  }

  async function saveBasicProfile(payload = {}) {
    return saveSection('basicProfile', payload)
  }

  async function saveIntroduction(payload = {}) {
    return saveSection('introduction', payload)
  }

  async function saveHistory(payload = {}) {
    return saveSection('history', payload)
  }

  async function saveMandate(payload = {}) {
    return saveSection('mandate', payload)
  }

  async function savePhilosophies(payload = {}) {
    return saveSection('philosophies', payload)
  }

  async function saveCoreFunctions(payload = {}) {
    return saveSection('coreFunctions', payload)
  }

  async function saveOrganizationStructure(payload = {}) {
    return saveSection('organizationStructure', payload)
  }

  async function saveDirectorGeneral(payload = {}) {
    return saveSection('directorGeneral', payload)
  }

  async function saveCTA(payload = {}) {
    return saveSection('cta', payload)
  }

  async function saveSlogan(payload = {}) {
    return saveSection('slogan', payload)
  }

  async function saveOutro(payload = {}) {
    return saveSection('outro', payload)
  }

  async function saveCommission(payload = {}) {
    return saveSection('review', payload)
  }

  async function submitForApproval(commissionId) {
    return withAsync(async () => {
      const response = await commissionAPI.submit(commissionId)
      if (response?.error) throw new Error(response.error)
      return applyCommissionResponse(response)
    })
  }

  async function approve(commissionId) {
    return withAsync(async () => {
      const response = await commissionAPI.approve(commissionId)
      if (response?.error) throw new Error(response.error)
      return applyCommissionResponse(response)
    })
  }

  async function reject(commissionId, reason = '') {
    return withAsync(async () => {
      const response = await commissionAPI.reject(commissionId, reason)
      if (response?.error) throw new Error(response.error)
      return applyCommissionResponse(response)
    })
  }

  async function publish(commissionId) {
    return withAsync(async () => {
      const response = await commissionAPI.publish(commissionId)
      if (response?.error) throw new Error(response.error)
      return applyCommissionResponse(response)
    })
  }

  async function unpublish(commissionId) {
    return withAsync(async () => {
      const response = await commissionAPI.unpublish(commissionId)
      if (response?.error) throw new Error(response.error)
      return applyCommissionResponse(response)
    })
  }

  async function schedulePublish(commissionId, payload = {}) {
    return withAsync(async () => {
      const response = await commissionAPI.schedulePublish(commissionId, payload)
      if (response?.error) throw new Error(response.error)
      return applyCommissionResponse(response)
    })
  }

  async function scheduleUnpublish(commissionId, payload = {}) {
    return withAsync(async () => {
      const response = await commissionAPI.scheduleUnpublish(commissionId, payload)
      if (response?.error) throw new Error(response.error)
      return applyCommissionResponse(response)
    })
  }

  async function cancelPublishSchedule(commissionId) {
    return withAsync(async () => {
      const response = await commissionAPI.cancelPublishSchedule(commissionId)
      if (response?.error) throw new Error(response.error)
      return applyCommissionResponse(response)
    })
  }

  async function cancelUnpublishSchedule(commissionId) {
    return withAsync(async () => {
      const response = await commissionAPI.cancelUnpublishSchedule(commissionId)
      if (response?.error) throw new Error(response.error)
      return applyCommissionResponse(response)
    })
  }

  async function archive(commissionId, reason = '') {
    return withAsync(async () => {
      const response = await commissionAPI.archive(commissionId, reason)
      if (response?.error) throw new Error(response.error)
      return applyCommissionResponse(response)
    })
  }

  async function restoreArchived(commissionId) {
    return withAsync(async () => {
      const response = await commissionAPI.restoreArchived(commissionId)
      if (response?.error) throw new Error(response.error)
      return applyCommissionResponse(response)
    })
  }

  async function softDelete(commissionId, reason = '') {
    return withAsync(async () => {
      const response = await commissionAPI.softDelete(commissionId, reason)
      if (response?.error) throw new Error(response.error)
      return applyCommissionResponse(response)
    })
  }

  async function restore(commissionId) {
    return withAsync(async () => {
      const response = await commissionAPI.restore(commissionId)
      if (response?.error) throw new Error(response.error)
      return applyCommissionResponse(response)
    })
  }

  async function remove(commissionId) {
    return withAsync(async () => {
      const response = await commissionAPI.remove(commissionId)
      if (response?.error) throw new Error(response.error)
      await fetchCommission()
      return response
    })
  }

  return {
    commission,
    management,
    loading,
    error,
    savingSections,
    setCommission,
    fetchCommission,
    fetchManagement,
    saveSection,
    saveBasicProfile,
    saveIntroduction,
    saveHistory,
    saveMandate,
    savePhilosophies,
    saveCoreFunctions,
    saveOrganizationStructure,
    saveDirectorGeneral,
    saveCTA,
    saveSlogan,
    saveOutro,
    saveCommission,
    submitForApproval,
    approve,
    reject,
    publish,
    unpublish,
    schedulePublish,
    scheduleUnpublish,
    cancelPublishSchedule,
    cancelUnpublishSchedule,
    archive,
    restoreArchived,
    softDelete,
    restore,
    remove,
    isSavingSection,
  }
})
