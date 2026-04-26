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
  navigateOnUpdate = false,
}) {
  const router = useRouter()
  const { loading, error, clearError, handleError, withAsync } = useAsyncState()
  const { pagination, setPagination } = usePagination()
  const { entity, entities, hasEntity, clearEntity } = useEntityState()
  const currentListMode = ref('all')
  const lastQuery = ref({})

  const publishedEntities = computed(() =>
    entities.value.filter((item) => getEffectiveWorkflowStatus(item) === 'published'),
  )
  const archivedEntities = computed(() =>
    entities.value.filter((item) => getEffectiveWorkflowStatus(item) === 'archived'),
  )

  function getEntityId(item = entity.value) {
    return item?.[idField]
  }

  function rememberListState(mode, query = {}) {
    currentListMode.value = mode
    lastQuery.value = { ...query }
  }

  function updateActiveCollection(nextEntity) {
    const nextId = nextEntity?.[idField]
    if (!nextId || !Array.isArray(entities.value) || !entities.value.length) return

    const targetIndex = entities.value.findIndex((item) => item?.[idField] === nextId)
    if (targetIndex === -1) return

    const nextStatus = getEffectiveWorkflowStatus(nextEntity)
    const shouldRemove =
      (currentListMode.value === 'published' && nextStatus !== 'published') ||
      (currentListMode.value === 'archived' && nextStatus !== 'archived')

    if (shouldRemove) {
      entities.value = entities.value.filter((item) => item?.[idField] !== nextId)
      return
    }

    entities.value = entities.value.map((item) => (item?.[idField] === nextId ? nextEntity : item))
  }

  function syncEntity(nextValue = {}, { setCurrent = false } = {}) {
    const normalized = withWorkflowState(nextValue)
    updateActiveCollection(normalized)

    if (setCurrent || getEntityId(entity.value) === normalized?.[idField]) {
      entity.value = normalized
    }

    return normalized
  }

  function setEntityState(nextValue = {}) {
    return syncEntity(nextValue, { setCurrent: true })
  }

  function setEntitiesState(nextItems = []) {
    entities.value = withWorkflowStateList(nextItems)
    return entities.value
  }

  async function reloadCurrentList() {
    if (currentListMode.value === 'published' && typeof api.listPublished === 'function') {
      return listPublished(lastQuery.value)
    }

    if (currentListMode.value === 'archived' && typeof api.listArchived === 'function') {
      return listArchived(lastQuery.value)
    }

    return list(lastQuery.value)
  }

  function goToDetailsIfConfigured(item = entity.value) {
    if (!detailsRouteName) return
    const id = getEntityId(item)
    if (!id) return
    router.push({ name: detailsRouteName, params: { [idField]: id } })
  }

  async function callApi(methodName, ...args) {
    const method = api?.[methodName]
    if (typeof method !== 'function') {
      return { error: `${methodName} is not implemented.` }
    }

    return method(...args)
  }

  function applyEntityResponse(res) {
    setEntityState(pickEntity(res, entityKey))
    return entity.value
  }

  async function runEntityMutation(methodName, ...args) {
    return withAsync(async () => {
      const res = await callApi(methodName, ...args)
      if (res?.error) handleError(res)

      return applyEntityResponse(res)
    })
  }

  async function runCollectionMutation(methodName, payload) {
    return withAsync(async () => {
      const res = await callApi(methodName, payload)
      if (res?.error) handleError(res)

      await reloadCurrentList()
      return res
    })
  }

  async function list(query = {}) {
    return withAsync(async () => {
      const res = await api.list(query)
      if (res?.error) handleError(res)

      rememberListState('all', query)
      setEntitiesState(pickList(res, collectionKeys))
      setPagination(res)
      return entities.value
    })
  }

  async function find(id) {
    return withAsync(async () => {
      const res = await callApi('find', id)
      if (res?.error) handleError(res)

      return applyEntityResponse(res)
    })
  }

  async function create(payload = {}, navigateToDetails = true) {
    return withAsync(async () => {
      const res = await callApi('create', payload)
      if (res?.error) handleError(res)

      applyEntityResponse(res)
      if (navigateToDetails) goToDetailsIfConfigured(entity.value)
      return entity.value
    })
  }

  async function update(id, payload = {}) {
    return withAsync(async () => {
      const res = await callApi('update', id, payload)
      if (res?.error) handleError(res)

      applyEntityResponse(res)
      if (navigateOnUpdate) goToDetailsIfConfigured(entity.value)
      return entity.value
    })
  }

  async function remove(id) {
    return withAsync(async () => {
      const res = await callApi('remove', id)
      if (res?.error) handleError(res)

      entities.value = entities.value.filter((item) => item?.[idField] !== id)
      clearEntity()
      await reloadCurrentList()
      return res
    })
  }

  async function softDelete(id, reason = '') {
    return runEntityMutation('softDelete', id, reason)
  }

  async function restore(id) {
    return runEntityMutation('restore', id)
  }

  async function submit(id) {
    return runEntityMutation('submit', id)
  }

  async function approve(id) {
    return runEntityMutation('approve', id)
  }

  async function reject(id, reason = '') {
    return runEntityMutation('reject', id, reason)
  }

  async function publish(id) {
    return runEntityMutation('publish', id)
  }

  async function unpublish(id) {
    return runEntityMutation('unpublish', id)
  }

  async function archive(id, reason = '') {
    return runEntityMutation('archive', id, reason)
  }

  async function restoreArchived(id) {
    return runEntityMutation('restoreArchived', id)
  }

  async function listPublished(query = {}) {
    return withAsync(async () => {
      const res = await callApi('listPublished', query)
      if (res?.error) handleError(res)

      rememberListState('published', query)
      setEntitiesState(pickList(res, collectionKeys))
      setPagination(res)
      return entities.value
    })
  }

  async function listArchived(query = {}) {
    return withAsync(async () => {
      const res = await callApi('listArchived', query)
      if (res?.error) handleError(res)

      rememberListState('archived', query)
      setEntitiesState(pickList(res, collectionKeys))
      setPagination(res)
      return entities.value
    })
  }

  async function schedulePublish(id, payload = {}) {
    return runEntityMutation('schedulePublish', id, payload)
  }

  async function scheduleUnpublish(id, payload = {}) {
    return runEntityMutation('scheduleUnpublish', id, payload)
  }

  async function cancelPublishSchedule(id) {
    return runEntityMutation('cancelPublishSchedule', id)
  }

  async function cancelUnpublishSchedule(id) {
    return runEntityMutation('cancelUnpublishSchedule', id)
  }

  async function bulkCreate(items = []) {
    return runCollectionMutation('bulkCreate', { items })
  }

  async function bulkUpdate(items = []) {
    return runCollectionMutation('bulkUpdate', { items })
  }

  async function bulkRemove(ids = []) {
    return runCollectionMutation('bulkRemove', { ids })
  }

  async function bulkSoftDelete(ids = [], reason = '') {
    return runCollectionMutation('bulkSoftDelete', { ids, reason })
  }

  async function bulkRestore(ids = []) {
    return runCollectionMutation('bulkRestore', { ids })
  }

  async function bulkPublish(ids = []) {
    return runCollectionMutation('bulkPublish', { ids })
  }

  async function bulkUnpublish(ids = []) {
    return runCollectionMutation('bulkUnpublish', { ids })
  }

  async function bulkSchedulePublish(items = []) {
    return runCollectionMutation('bulkSchedulePublish', { items })
  }

  async function bulkScheduleUnpublish(items = []) {
    return runCollectionMutation('bulkScheduleUnpublish', { items })
  }

  async function bulkCancelPublishSchedule(ids = []) {
    return runCollectionMutation('bulkCancelPublishSchedule', { ids })
  }

  async function bulkCancelUnpublishSchedule(ids = []) {
    return runCollectionMutation('bulkCancelUnpublishSchedule', { ids })
  }

  async function bulkArchive(ids = [], reason = '') {
    return runCollectionMutation('bulkArchive', { ids, reason })
  }

  async function bulkRestoreArchived(ids = []) {
    return runCollectionMutation('bulkRestoreArchived', { ids })
  }

  async function processScheduled() {
    return withAsync(async () => {
      const res = await callApi('processScheduled')
      if (res?.error) handleError(res)

      await reloadCurrentList()
      return res
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
    currentListMode,
    clearError,
    clearEntity,
    getEntityId,
    handleError,
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
    schedulePublish,
    scheduleUnpublish,
    cancelPublishSchedule,
    cancelUnpublishSchedule,
    bulkCreate,
    bulkUpdate,
    bulkRemove,
    bulkSoftDelete,
    bulkRestore,
    bulkPublish,
    bulkUnpublish,
    bulkSchedulePublish,
    bulkScheduleUnpublish,
    bulkCancelPublishSchedule,
    bulkCancelUnpublishSchedule,
    bulkArchive,
    bulkRestoreArchived,
    processScheduled,
    lastQuery,
    reloadCurrentList,
    setEntitiesState,
    setEntityState,
    syncEntity,
    withAsync,
  }
}
