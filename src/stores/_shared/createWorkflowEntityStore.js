import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useAsyncState } from '@/stores/_shared/useAsyncState'
import { useEntityState } from '@/stores/_shared/useEntityState'
import { usePagination } from '@/stores/_shared/usePagination'
import {
  getEffectiveWorkflowStatus,
  withWorkflowState,
  withWorkflowStateList,
} from '@/utils/contentWorkflow'

function pickList(res, keys = []) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.items)) return res.items

  for (const key of keys) {
    if (Array.isArray(res?.[key])) return res[key]
  }

  if (Array.isArray(res?.data)) return res.data
  return []
}

function pickEntity(res, key) {
  if (!res) return {}
  if (key && res[key]) return res[key]
  return res
}

export function createWorkflowEntityStore({
  api,
  idField,
  entityKey,
  collectionKeys = [],
  detailsRouteName = null,
}) {
  const router = useRouter()
  const { loading, error, clearError, handleError, withAsync } = useAsyncState()
  const { pagination, setPagination } = usePagination()
  const { entity, entities, hasEntity, clearEntity } = useEntityState()

  const publishedEntities = computed(() =>
    entities.value.filter((item) => getEffectiveWorkflowStatus(item) === 'published'),
  )
  const archivedEntities = computed(() =>
    entities.value.filter((item) => getEffectiveWorkflowStatus(item) === 'archived'),
  )

  function getEntityId(item = entity.value) {
    return item?.[idField]
  }

  function goToDetailsIfConfigured(item = entity.value) {
    if (!detailsRouteName) return
    const id = getEntityId(item)
    if (!id) return
    router.push({ name: detailsRouteName, params: { [idField]: id } })
  }

  async function list(query = {}) {
    return withAsync(async () => {
      const res = await api.list(query)
      if (res?.error) handleError(res)

      entities.value = withWorkflowStateList(pickList(res, collectionKeys))
      setPagination(res)
      return entities.value
    })
  }

  async function find(id) {
    return withAsync(async () => {
      const res = await api.find(id)
      if (res?.error) handleError(res)

      entity.value = withWorkflowState(pickEntity(res, entityKey))
      return entity.value
    })
  }

  async function create(payload = {}, navigateToDetails = true) {
    return withAsync(async () => {
      const res = await api.create(payload)
      if (res?.error) handleError(res)

      entity.value = withWorkflowState(pickEntity(res, entityKey))
      if (navigateToDetails) goToDetailsIfConfigured(entity.value)
      return entity.value
    })
  }

  async function update(id, payload = {}) {
    return withAsync(async () => {
      const res = await api.update(id, payload)
      if (res?.error) handleError(res)

      entity.value = withWorkflowState(pickEntity(res, entityKey))
      return entity.value
    })
  }

  async function remove(id) {
    return withAsync(async () => {
      const res = await api.remove(id)
      if (res?.error) handleError(res)

      clearEntity()
      await list()
      return res
    })
  }

  async function softDelete(id, reason = '') {
    return withAsync(async () => {
      const res = await api.softDelete(id, reason)
      if (res?.error) handleError(res)

      entity.value = withWorkflowState(pickEntity(res, entityKey))
      return entity.value
    })
  }

  async function restore(id) {
    return withAsync(async () => {
      const res = await api.restore(id)
      if (res?.error) handleError(res)

      entity.value = withWorkflowState(pickEntity(res, entityKey))
      return entity.value
    })
  }

  async function submit(id) {
    return withAsync(async () => {
      const res = await api.submit(id)
      if (res?.error) handleError(res)

      entity.value = withWorkflowState(pickEntity(res, entityKey))
      return entity.value
    })
  }

  async function approve(id) {
    return withAsync(async () => {
      const res = await api.approve(id)
      if (res?.error) handleError(res)

      entity.value = withWorkflowState(pickEntity(res, entityKey))
      return entity.value
    })
  }

  async function reject(id, reason = '') {
    return withAsync(async () => {
      const res = await api.reject(id, reason)
      if (res?.error) handleError(res)

      entity.value = withWorkflowState(pickEntity(res, entityKey))
      return entity.value
    })
  }

  async function publish(id) {
    return withAsync(async () => {
      const res = await api.publish(id)
      if (res?.error) handleError(res)

      entity.value = withWorkflowState(pickEntity(res, entityKey))
      return entity.value
    })
  }

  async function unpublish(id) {
    return withAsync(async () => {
      const res = await api.unpublish(id)
      if (res?.error) handleError(res)

      entity.value = withWorkflowState(pickEntity(res, entityKey))
      return entity.value
    })
  }

  async function archive(id, reason = '') {
    return withAsync(async () => {
      const res = await api.archive(id, reason)
      if (res?.error) handleError(res)

      entity.value = withWorkflowState(pickEntity(res, entityKey))
      return entity.value
    })
  }

  async function restoreArchived(id) {
    return withAsync(async () => {
      const res = await api.restoreArchived(id)
      if (res?.error) handleError(res)

      entity.value = pickEntity(res, entityKey)
      return entity.value
    })
  }

  async function listPublished(query = {}) {
    return withAsync(async () => {
      const res = await api.listPublished(query)
      if (res?.error) handleError(res)

      return withWorkflowStateList(pickList(res, collectionKeys))
    })
  }

  async function listArchived(query = {}) {
    return withAsync(async () => {
      const res = await api.listArchived(query)
      if (res?.error) handleError(res)

      return withWorkflowStateList(pickList(res, collectionKeys))
    })
  }

  return {
    entity,
    entities,
    loading,
    error,
    pagination,
    hasEntity,
    publishedEntities,
    archivedEntities,
    clearError,
    clearEntity,
    getEntityId,
    list,
    find,
    create,
    update,
    remove,
    softDelete,
    restore,
    submit,
    approve,
    reject,
    publish,
    unpublish,
    archive,
    restoreArchived,
    listPublished,
    listArchived,
  }
}
