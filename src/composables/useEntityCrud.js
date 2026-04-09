import { reactive, ref } from 'vue'

import { withWorkflowState, withWorkflowStateList } from '@/utils/contentWorkflow'
import { extractErrorMessage } from '@/utils/httpError'

function resolveError(error) {
  if (typeof error === 'string') return error
  return extractErrorMessage(error, 'Request failed.')
}

function defaultPagination() {
  return {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  }
}

export function useEntityCrud(adapter = {}) {
  const items = ref([])
  const entity = ref(null)
  const loading = ref(false)
  const error = ref('')
  const pagination = reactive(defaultPagination())

  function clearError() {
    error.value = ''
  }

  function setPagination(source = {}) {
    pagination.page = Number(source.page || source.currentPage || pagination.page || 1)
    pagination.limit = Number(source.limit || source.pageSize || pagination.limit || 20)
    pagination.total = Number(source.total || source.count || source.totalItems || 0)
    pagination.totalPages = Number(
      source.totalPages ||
        source.pages ||
        (pagination.limit ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1),
    )
  }

  function mapItems(response) {
    const mapped =
      typeof adapter.mapItems === 'function' ? adapter.mapItems(response) : response?.items || []
    return withWorkflowStateList(mapped)
  }

  function mapEntity(response) {
    const mapped =
      typeof adapter.mapEntity === 'function'
        ? adapter.mapEntity(response)
        : response?.item || response || null
    return mapped ? withWorkflowState(mapped) : null
  }

  function mapId(record = {}) {
    if (typeof adapter.getId === 'function') return adapter.getId(record)
    return record?.id || record?._id || null
  }

  async function run(task) {
    loading.value = true
    clearError()
    try {
      return await task()
    } catch (err) {
      error.value = resolveError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCollection(method = 'list', query = {}) {
    const task = adapter?.[method]
    if (typeof task !== 'function') return []

    return run(async () => {
      const response = await task(query)
      if (response?.error) throw response

      items.value = mapItems(response)
      setPagination(response)
      return items.value
    })
  }

  async function fetchList(query = {}) {
    return fetchCollection('list', query)
  }

  async function fetchPublishedList(query = {}) {
    return fetchCollection('listPublished', query)
  }

  async function fetchArchivedList(query = {}) {
    return fetchCollection('listArchived', query)
  }

  async function fetchOne(id) {
    return run(async () => {
      const response = await adapter.find(id)
      if (response?.error) throw response

      entity.value = mapEntity(response)
      return entity.value
    })
  }

  async function createOne(payload = {}) {
    return run(async () => {
      const response = await adapter.create(payload)
      if (response?.error) throw response

      const created = mapEntity(response)
      entity.value = created
      return created
    })
  }

  async function updateOne(id, payload = {}) {
    return run(async () => {
      const response = await adapter.update(id, payload)
      if (response?.error) throw response

      const updated = mapEntity(response)
      entity.value = updated
      return updated
    })
  }

  async function removeOne(id) {
    if (typeof adapter.remove !== 'function') return null

    return run(async () => {
      const response = await adapter.remove(id)
      if (response?.error) throw response

      items.value = items.value.filter((item) => mapId(item) !== id)
      if (entity.value && mapId(entity.value) === id) {
        entity.value = null
      }
      return response
    })
  }

  function updateLocalEntityFromResponse(response) {
    const mapped = mapEntity(response)
    if (mapped && mapId(mapped)) {
      entity.value = mapped
    }
  }

  function replaceLocalItems(nextItems = []) {
    items.value = withWorkflowStateList(nextItems)
  }

  async function runWorkflow(action, id, data = {}) {
    const taskMap = {
      submit: adapter.submit,
      approve: adapter.approve,
      reject: adapter.reject,
      publish: adapter.publish,
      unpublish: adapter.unpublish,
      schedulePublish: adapter.schedulePublish,
      scheduleUnpublish: adapter.scheduleUnpublish,
      cancelPublishSchedule: adapter.cancelPublishSchedule,
      cancelUnpublishSchedule: adapter.cancelUnpublishSchedule,
      archive: adapter.archive,
      restore: adapter.restore,
      restoreArchived: adapter.restoreArchived,
      softDelete: adapter.softDelete,
      delete: adapter.remove,
    }

    const task = taskMap[action]
    if (typeof task !== 'function') {
      console.warn(`Action "${action}" is not implemented in adapter for this resource.`)
      return null
    }

    return run(async () => {
      const response = await task(id, data)
      if (response?.error) throw response
      updateLocalEntityFromResponse(response)
      return response
    })
  }

  async function runBulkWorkflow(action, payload = {}) {
    const taskMap = {
      publish: adapter.bulkPublish,
      unpublish: adapter.bulkUnpublish,
      schedulePublish: adapter.bulkSchedulePublish,
      scheduleUnpublish: adapter.bulkScheduleUnpublish,
      cancelPublishSchedule: adapter.bulkCancelPublishSchedule,
      cancelUnpublishSchedule: adapter.bulkCancelUnpublishSchedule,
      archive: adapter.bulkArchive,
      restore: adapter.bulkRestore,
      restoreArchived: adapter.bulkRestoreArchived,
      softDelete: adapter.bulkSoftDelete,
      delete: adapter.bulkRemove,
    }

    const task = taskMap[action]
    if (typeof task !== 'function') {
      console.warn(`Bulk action "${action}" is not implemented in adapter for this resource.`)
      return null
    }

    return run(async () => {
      const response = await task(payload)
      if (response?.error) throw response

      if (Array.isArray(response?.items)) {
        replaceLocalItems(response.items)
      }

      return response
    })
  }

  return {
    items,
    entity,
    loading,
    error,
    pagination,
    clearError,
    fetchList,
    fetchPublishedList,
    fetchArchivedList,
    fetchOne,
    createOne,
    updateOne,
    removeOne,
    runWorkflow,
    runBulkWorkflow,
  }
}
