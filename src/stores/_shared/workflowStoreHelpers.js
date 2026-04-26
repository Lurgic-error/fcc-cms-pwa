import { computed } from 'vue'

import { createWorkflowEntityStore } from '@/stores/_shared/createWorkflowEntityStore'
import { getEffectiveWorkflowStatus, withWorkflowStateList } from '@/utils/contentWorkflow'

function buildIdPayload(idField, id) {
  return { [idField]: id }
}

function buildSchedulePayload(idField, scheduleField, id, payload = {}) {
  return {
    [idField]: id,
    [scheduleField]: payload?.[scheduleField] ?? payload,
    timezone: payload?.timezone,
  }
}

function normalizeCollection(res, keys = []) {
  for (const key of keys) {
    if (Array.isArray(res?.[key])) return res[key]
  }

  return Array.isArray(res?.items) ? res.items : Array.isArray(res?.data) ? res.data : []
}

function assignAlias(target, key, value) {
  if (!key || typeof value !== 'function') return
  target[key] = value
}

export function createWorkflowApiAdapter({
  api,
  idField,
  payloadKey = '',
  methods = {},
  wrapCreatePayload = Boolean(payloadKey),
  schedulePublishField = 'scheduledPublishAt',
  scheduleUnpublishField = 'scheduledUnpublishAt',
}) {
  function call(methodKey, payload) {
    const methodName = methods?.[methodKey]
    const method = methodName ? api?.[methodName] : null
    return typeof method === 'function' ? method(payload) : undefined
  }

  return {
    list: (query = {}) => call('list', query),
    find: (id) => call('find', buildIdPayload(idField, id)),
    listPublished: (query = {}) => call('listPublished', query),
    listArchived: (query = {}) => call('listArchived', query),
    create: (payload = {}) =>
      call('create', wrapCreatePayload && payloadKey ? { [payloadKey]: payload } : payload),
    bulkCreate: ({ items = [] } = {}) => call('bulkCreate', { items }),
    update: (id, payload = {}) => call('update', { [idField]: id, ...payload }),
    bulkUpdate: ({ items = [] } = {}) => call('bulkUpdate', { items }),
    remove: (id) => call('remove', buildIdPayload(idField, id)),
    bulkRemove: ({ ids = [] } = {}) => call('bulkRemove', { ids }),
    softDelete: (id, reason = '') => call('softDelete', { [idField]: id, reason }),
    bulkSoftDelete: ({ ids = [], reason = '' } = {}) => call('bulkSoftDelete', { ids, reason }),
    restore: (id) => call('restore', buildIdPayload(idField, id)),
    bulkRestore: ({ ids = [] } = {}) => call('bulkRestore', { ids }),
    submit: (id) => call('submit', buildIdPayload(idField, id)),
    approve: (id) => call('approve', buildIdPayload(idField, id)),
    reject: (id, reason = '') => call('reject', { [idField]: id, reason }),
    publish: (id) => call('publish', buildIdPayload(idField, id)),
    bulkPublish: ({ ids = [] } = {}) => call('bulkPublish', { ids }),
    unpublish: (id) => call('unpublish', buildIdPayload(idField, id)),
    bulkUnpublish: ({ ids = [] } = {}) => call('bulkUnpublish', { ids }),
    schedulePublish: (id, payload = {}) =>
      call('schedulePublish', buildSchedulePayload(idField, schedulePublishField, id, payload)),
    scheduleUnpublish: (id, payload = {}) =>
      call(
        'scheduleUnpublish',
        buildSchedulePayload(idField, scheduleUnpublishField, id, payload),
      ),
    bulkSchedulePublish: ({ items = [] } = {}) => call('bulkSchedulePublish', { items }),
    bulkScheduleUnpublish: ({ items = [] } = {}) => call('bulkScheduleUnpublish', { items }),
    cancelPublishSchedule: (id) => call('cancelPublishSchedule', buildIdPayload(idField, id)),
    cancelUnpublishSchedule: (id) =>
      call('cancelUnpublishSchedule', buildIdPayload(idField, id)),
    bulkCancelPublishSchedule: ({ ids = [] } = {}) =>
      call('bulkCancelPublishSchedule', { ids }),
    bulkCancelUnpublishSchedule: ({ ids = [] } = {}) =>
      call('bulkCancelUnpublishSchedule', { ids }),
    archive: (id, reason = '') => call('archive', { [idField]: id, reason }),
    bulkArchive: ({ ids = [], reason = '' } = {}) => call('bulkArchive', { ids, reason }),
    restoreArchived: (id) => call('restoreArchived', buildIdPayload(idField, id)),
    bulkRestoreArchived: ({ ids = [] } = {}) => call('bulkRestoreArchived', { ids }),
    processScheduled: () => call('processScheduled'),
  }
}

export async function loadWorkflowCollection({
  workflowStore,
  request,
  target,
  keys = [],
  query = {},
}) {
  return workflowStore.withAsync(async () => {
    const res = await request(query)
    if (res?.error) workflowStore.handleError(res)

    target.value = withWorkflowStateList(normalizeCollection(res, keys))
    return target.value
  })
}

export async function loadWorkflowEntities({
  workflowStore,
  request,
  keys = [],
  query = {},
}) {
  return workflowStore.withAsync(async () => {
    const res = await request(query)
    if (res?.error) workflowStore.handleError(res)

    workflowStore.setEntitiesState(normalizeCollection(res, keys))
    return workflowStore.entities.value
  })
}

export async function runWorkflowReloadingRequest({ workflowStore, request }) {
  return workflowStore.withAsync(async () => {
    const res = await request()
    if (res?.error) workflowStore.handleError(res)

    await workflowStore.reloadCurrentList()
    return res
  })
}

export function createWorkflowBoundStore({
  workflowConfig,
  bindings,
  extraState = () => ({}),
  extraActions = () => ({}),
  aliasOverrides = {},
}) {
  const workflowStore = createWorkflowEntityStore(workflowConfig)
  const resolvedState =
    typeof extraState === 'function' ? (extraState({ workflowStore }) ?? {}) : extraState || {}
  const resolvedActions =
    typeof extraActions === 'function'
      ? (extraActions({ workflowStore, ...resolvedState }) ?? {})
      : extraActions || {}
  const resolvedAliasOverrides =
    typeof aliasOverrides === 'function'
      ? (aliasOverrides({ workflowStore, ...resolvedState, ...resolvedActions }) ?? {})
      : aliasOverrides || {}

  return createWorkflowStoreBindings({
    workflowStore,
    ...bindings,
    extraState: resolvedState,
    extraActions: resolvedActions,
    aliasOverrides: resolvedAliasOverrides,
  })
}

export function createWorkflowStoreBindings({
  workflowStore,
  entityRefKey,
  collectionRefKey,
  publishedRefKey,
  archivedRefKey,
  hasRefKey,
  singular,
  plural,
  extraState = {},
  extraActions = {},
  aliasOverrides = {},
  includeProcessScheduled = false,
}) {
  const isPublished = computed(
    () => getEffectiveWorkflowStatus(workflowStore.entity.value) === 'published',
  )
  const isArchived = computed(
    () => getEffectiveWorkflowStatus(workflowStore.entity.value) === 'archived',
  )
  const isScheduled = computed(
    () => getEffectiveWorkflowStatus(workflowStore.entity.value) === 'scheduled',
  )

  const aliases = {
    submit: workflowStore.submit,
    submitForApproval: workflowStore.submit,
    approve: workflowStore.approve,
    reject: workflowStore.reject,
    publish: workflowStore.publish,
    unpublish: workflowStore.unpublish,
    schedulePublish: workflowStore.schedulePublish,
    scheduleUnpublish: workflowStore.scheduleUnpublish,
    cancelPublishSchedule: workflowStore.cancelPublishSchedule,
    cancelUnpublishSchedule: workflowStore.cancelUnpublishSchedule,
    archive: workflowStore.archive,
    restoreArchived: workflowStore.restoreArchived,
    softDelete: workflowStore.softDelete,
    restore: workflowStore.restore,
    remove: workflowStore.remove,
    bulkPublish: workflowStore.bulkPublish,
    bulkUnpublish: workflowStore.bulkUnpublish,
    bulkSchedulePublish: workflowStore.bulkSchedulePublish,
    bulkScheduleUnpublish: workflowStore.bulkScheduleUnpublish,
    bulkCancelPublishSchedule: workflowStore.bulkCancelPublishSchedule,
    bulkCancelUnpublishSchedule: workflowStore.bulkCancelUnpublishSchedule,
    bulkArchive: workflowStore.bulkArchive,
    bulkRestore: workflowStore.bulkRestore,
    bulkRestoreArchived: workflowStore.bulkRestoreArchived,
    bulkSoftDelete: workflowStore.bulkSoftDelete,
    bulkRemove: workflowStore.bulkRemove,
  }

  assignAlias(aliases, `list${plural}`, workflowStore.list)
  assignAlias(aliases, `find${singular}`, workflowStore.find)
  assignAlias(aliases, `listPublished${plural}`, workflowStore.listPublished)
  assignAlias(aliases, `listArchived${plural}`, workflowStore.listArchived)
  assignAlias(aliases, `create${singular}`, workflowStore.create)
  assignAlias(aliases, `create${plural}`, workflowStore.bulkCreate)
  assignAlias(aliases, `update${singular}`, workflowStore.update)
  assignAlias(aliases, `update${plural}`, workflowStore.bulkUpdate)
  assignAlias(aliases, `delete${singular}`, workflowStore.remove)
  assignAlias(aliases, `delete${plural}`, workflowStore.bulkRemove)
  assignAlias(aliases, `softDelete${singular}`, workflowStore.softDelete)
  assignAlias(aliases, `softDelete${plural}`, workflowStore.bulkSoftDelete)
  assignAlias(aliases, `restore${singular}`, workflowStore.restore)
  assignAlias(aliases, `restore${plural}`, workflowStore.bulkRestore)
  assignAlias(aliases, `submit${singular}`, workflowStore.submit)
  assignAlias(aliases, `submit${singular}ForApproval`, workflowStore.submit)
  assignAlias(aliases, `approve${singular}`, workflowStore.approve)
  assignAlias(aliases, `reject${singular}`, workflowStore.reject)
  assignAlias(aliases, `publish${singular}`, workflowStore.publish)
  assignAlias(aliases, `publish${plural}`, workflowStore.bulkPublish)
  assignAlias(aliases, `unpublish${singular}`, workflowStore.unpublish)
  assignAlias(aliases, `unpublish${plural}`, workflowStore.bulkUnpublish)
  assignAlias(aliases, `schedule${singular}Publish`, workflowStore.schedulePublish)
  assignAlias(aliases, `schedule${singular}Unpublish`, workflowStore.scheduleUnpublish)
  assignAlias(aliases, `schedule${plural}Publish`, workflowStore.bulkSchedulePublish)
  assignAlias(aliases, `schedule${plural}Unpublish`, workflowStore.bulkScheduleUnpublish)
  assignAlias(aliases, `cancel${singular}PublishSchedule`, workflowStore.cancelPublishSchedule)
  assignAlias(aliases, `cancel${singular}UnpublishSchedule`, workflowStore.cancelUnpublishSchedule)
  assignAlias(
    aliases,
    `cancel${plural}PublishSchedule`,
    workflowStore.bulkCancelPublishSchedule,
  )
  assignAlias(
    aliases,
    `cancel${plural}UnpublishSchedule`,
    workflowStore.bulkCancelUnpublishSchedule,
  )
  assignAlias(aliases, `archive${singular}`, workflowStore.archive)
  assignAlias(aliases, `archive${plural}`, workflowStore.bulkArchive)
  assignAlias(aliases, `restoreArchived${singular}`, workflowStore.restoreArchived)
  assignAlias(aliases, `restoreArchived${plural}`, workflowStore.bulkRestoreArchived)

  if (includeProcessScheduled) {
    assignAlias(aliases, `processScheduled${plural}`, workflowStore.processScheduled)
  }

  Object.assign(aliases, aliasOverrides)

  return {
    loading: workflowStore.loading,
    error: workflowStore.error,
    clearError: workflowStore.clearError,
    pagination: workflowStore.pagination,

    [entityRefKey]: workflowStore.entity,
    [collectionRefKey]: workflowStore.entities,
    [publishedRefKey]: workflowStore.publishedEntities,
    [archivedRefKey]: workflowStore.archivedEntities,
    ...extraState,

    [hasRefKey]: workflowStore.hasEntity,
    isPublished,
    isArchived,
    isScheduled,

    ...aliases,
    ...extraActions,
  }
}
