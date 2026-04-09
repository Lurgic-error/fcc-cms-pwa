import { partnersAPI } from '@/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAsyncState } from '@/stores/_shared/useAsyncState'
import { useEntityState } from '@/stores/_shared/useEntityState'
import { usePagination } from '@/stores/_shared/usePagination'

export const usePartnersStore = defineStore('partners', () => {
  const router = useRouter()

  const { loading, error, clearError, handleError, withAsync } = useAsyncState()
  const { pagination, setPagination } = usePagination()
  const {
    entity: partner,
    entities: partners,
    hasEntity: hasPartner,
    clearEntity,
  } = useEntityState()

  const publishedPartners = ref([])
  const archivedPartners = ref([])

  const isPublished = computed(() => partner.value?.publicationStatus === 'published')
  const isArchived = computed(() => partner.value?.isArchived === true)

  function goToDetails(partnerId) {
    router.push({
      name: 'partners.details',
      params: { partnerId },
    })
  }

  async function refreshList(query = {}) {
    await listPartners(query)
  }

  async function listPartners(query = {}) {
    return withAsync(async () => {
      const res = await partnersAPI.listPartners(query)
      if (res?.error) handleError(res)

      partners.value = res.items || res.partners || []
      setPagination(res)
      return partners.value
    })
  }

  async function findPartner(partnerId) {
    return withAsync(async () => {
      const res = await partnersAPI.findPartner({ partnerId })
      if (res?.error) handleError(res)

      partner.value = res.partner || res
      return partner.value
    })
  }

  async function listPublishedPartners(query = {}) {
    return withAsync(async () => {
      const res = await partnersAPI.listPublishedPartners(query)
      if (res?.error) handleError(res)

      publishedPartners.value = res.items || res.partners || []
      return publishedPartners.value
    })
  }

  async function listArchivedPartners(query = {}) {
    return withAsync(async () => {
      const res = await partnersAPI.listArchivedPartners(query)
      if (res?.error) handleError(res)

      archivedPartners.value = res.items || res.partners || []
      return archivedPartners.value
    })
  }

  async function createPartner(partnerInfo) {
    return withAsync(async () => {
      const res = await partnersAPI.createPartner({ partnerInfo })
      if (res?.error) handleError(res)

      partner.value = res.partner || res
      if (partner.value?.partnerId) goToDetails(partner.value.partnerId)
      return partner.value
    })
  }

  async function updatePartner(partnerId, partnerInfo) {
    return withAsync(async () => {
      const res = await partnersAPI.updatePartner({ partnerId, ...partnerInfo })
      if (res?.error) handleError(res)

      partner.value = res.partner || res
      goToDetails(partnerId)
      return partner.value
    })
  }

  async function deletePartner(partnerId) {
    return withAsync(async () => {
      const res = await partnersAPI.deletePartner({ partnerId })
      if (res?.error) handleError(res)

      clearEntity()
      await refreshList()
      return res
    })
  }

  async function publishPartner(partnerId) {
    return withAsync(async () => {
      const res = await partnersAPI.publishPartner({ partnerId })
      if (res?.error) handleError(res)

      partner.value = res.partner || res
      return partner.value
    })
  }

  async function unpublishPartner(partnerId) {
    return withAsync(async () => {
      const res = await partnersAPI.unpublishPartner({ partnerId })
      if (res?.error) handleError(res)

      partner.value = res.partner || res
      return partner.value
    })
  }

  async function archivePartner(partnerId, reason) {
    return withAsync(async () => {
      const res = await partnersAPI.archivePartner({ partnerId, reason })
      if (res?.error) handleError(res)

      partner.value = res.partner || res
      return partner.value
    })
  }

  async function restoreArchivedPartner(partnerId) {
    return withAsync(async () => {
      const res = await partnersAPI.restoreArchivedPartner({ partnerId })
      if (res?.error) handleError(res)

      partner.value = res.partner || res
      return partner.value
    })
  }

  return {
    partner,
    partners,
    publishedPartners,
    archivedPartners,
    pagination,
    loading,
    error,
    hasPartner,
    isPublished,
    isArchived,
    clearError,
    clearEntity,
    listPartners,
    findPartner,
    listPublishedPartners,
    listArchivedPartners,
    createPartner,
    updatePartner,
    deletePartner,
    publishPartner,
    unpublishPartner,
    archivePartner,
    restoreArchivedPartner,
  }
})
