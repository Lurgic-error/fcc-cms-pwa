import { PERMISSIONS } from '@/router/constants'
import { getEffectiveWorkflowStatus, getWorkflowSchedule } from '@/utils/contentWorkflow'

const ACTION_META = Object.freeze({
  view: { label: 'View Details', group: 'navigation' },
  edit: { label: 'Edit', group: 'navigation', permission: PERMISSIONS.UPDATE },
  respond: { label: 'Respond', group: 'navigation', permission: PERMISSIONS.UPDATE },
  submit: {
    label: 'Submit for Approval',
    group: 'workflow',
    permission: PERMISSIONS.UPDATE,
  },
  approve: { label: 'Approve', group: 'workflow', permission: PERMISSIONS.REVIEW },
  reject: { label: 'Reject', group: 'workflow', permission: PERMISSIONS.REVIEW, danger: true },
  publish: { label: 'Publish', group: 'publishing', permission: PERMISSIONS.PUBLISH },
  unpublish: { label: 'Unpublish', group: 'publishing', permission: PERMISSIONS.PUBLISH },
  schedulePublish: {
    label: 'Schedule Publish',
    group: 'scheduling',
    permission: PERMISSIONS.PUBLISH,
  },
  scheduleUnpublish: {
    label: 'Schedule Unpublish',
    group: 'scheduling',
    permission: PERMISSIONS.PUBLISH,
  },
  cancelPublishSchedule: {
    label: 'Cancel Publish Schedule',
    group: 'scheduling',
    permission: PERMISSIONS.PUBLISH,
  },
  cancelUnpublishSchedule: {
    label: 'Cancel Unpublish Schedule',
    group: 'scheduling',
    permission: PERMISSIONS.PUBLISH,
  },
  archive: { label: 'Archive', group: 'lifecycle', permission: PERMISSIONS.ARCHIVE },
  restoreArchived: {
    label: 'Restore from Archive',
    group: 'lifecycle',
    permission: PERMISSIONS.ARCHIVE,
  },
  softDelete: {
    label: 'Soft Delete',
    group: 'lifecycle',
    permission: PERMISSIONS.DELETE,
    danger: true,
  },
  restore: { label: 'Restore', group: 'lifecycle', permission: PERMISSIONS.DELETE },
  delete: {
    label: 'Delete Permanently',
    group: 'lifecycle',
    permission: PERMISSIONS.DELETE,
    danger: true,
  },
})

const GROUP_ORDER = Object.freeze([
  'navigation',
  'workflow',
  'publishing',
  'scheduling',
  'lifecycle',
])

const SINGLE_METHODS = Object.freeze({
  submit: 'submit',
  approve: 'approve',
  reject: 'reject',
  publish: 'publish',
  unpublish: 'unpublish',
  schedulePublish: 'schedulePublish',
  scheduleUnpublish: 'scheduleUnpublish',
  cancelPublishSchedule: 'cancelPublishSchedule',
  cancelUnpublishSchedule: 'cancelUnpublishSchedule',
  archive: 'archive',
  restoreArchived: 'restoreArchived',
  softDelete: 'softDelete',
  restore: 'restore',
  delete: 'remove',
})

const BULK_METHODS = Object.freeze({
  publish: 'bulkPublish',
  unpublish: 'bulkUnpublish',
  schedulePublish: 'bulkSchedulePublish',
  scheduleUnpublish: 'bulkScheduleUnpublish',
  cancelPublishSchedule: 'bulkCancelPublishSchedule',
  cancelUnpublishSchedule: 'bulkCancelUnpublishSchedule',
  archive: 'bulkArchive',
  restoreArchived: 'bulkRestoreArchived',
  softDelete: 'bulkSoftDelete',
  restore: 'bulkRestore',
  delete: 'bulkRemove',
})

function canUseAction(key, hasPermission) {
  const permission = ACTION_META[key]?.permission
  return typeof hasPermission !== 'function' || !permission || hasPermission(permission)
}

function adapterHasMethod(adapter = {}, method = '') {
  return typeof adapter?.[method] === 'function'
}

function buildAction(key, overrides = {}) {
  return {
    key,
    ...ACTION_META[key],
    ...overrides,
  }
}

function normalizeRecord(record = {}) {
  const status = getEffectiveWorkflowStatus(record)
  const schedule = getWorkflowSchedule(record)
  const isArchived =
    record?.isArchived === true || record?.archived === true || status === 'archived'
  const isDeleted = record?.isDeleted === true || record?.deleted === true || status === 'deleted'

  return {
    status,
    ...schedule,
    isArchived,
    isDeleted,
  }
}

function isRecordEligible(action, record = {}) {
  const { status, hasPublishSchedule, hasUnpublishSchedule, isArchived, isDeleted } =
    normalizeRecord(record)

  switch (action) {
    case 'submit':
      return !isDeleted && !isArchived && ['draft', 'rejected', 'unpublished'].includes(status)
    case 'approve':
    case 'reject':
      return !isDeleted && !isArchived && status === 'submitted'
    case 'publish':
      return !isDeleted && !isArchived && status === 'approved'
    case 'unpublish':
      return !isDeleted && !isArchived && status === 'published'
    case 'schedulePublish':
      return (
        !isDeleted &&
        !isArchived &&
        ['approved', 'unpublished'].includes(status) &&
        !hasPublishSchedule
      )
    case 'scheduleUnpublish':
      return !isDeleted && !isArchived && status === 'published' && !hasUnpublishSchedule
    case 'cancelPublishSchedule':
      return !isDeleted && !isArchived && hasPublishSchedule
    case 'cancelUnpublishSchedule':
      return !isDeleted && !isArchived && hasUnpublishSchedule
    case 'archive':
      return !isDeleted && !isArchived
    case 'restoreArchived':
      return isArchived && !isDeleted
    case 'softDelete':
      return !isDeleted
    case 'restore':
      return isDeleted
    case 'delete':
      return isDeleted
    default:
      return true
  }
}

function sortActions(actions = []) {
  return [...actions].sort((left, right) => {
    const leftIndex = GROUP_ORDER.indexOf(left.group)
    const rightIndex = GROUP_ORDER.indexOf(right.group)
    const normalizedLeftIndex = leftIndex === -1 ? GROUP_ORDER.length : leftIndex
    const normalizedRightIndex = rightIndex === -1 ? GROUP_ORDER.length : rightIndex

    if (normalizedLeftIndex !== normalizedRightIndex) {
      return normalizedLeftIndex - normalizedRightIndex
    }

    return left.label.localeCompare(right.label)
  })
}

export function resolveEntityActionItems({
  record = null,
  adapter = {},
  canView = false,
  canEdit = false,
  hasPermission = () => true,
  extraActions = [],
} = {}) {
  const actions = []

  if (canView) {
    actions.push(buildAction('view'))
  }

  if (canEdit && canUseAction('edit', hasPermission)) {
    actions.push(buildAction('edit'))
  }

  for (const action of extraActions) {
    if (!action?.key) continue
    if (!canUseAction(action.key, hasPermission)) continue
    actions.push(action)
  }

  for (const [key, method] of Object.entries(SINGLE_METHODS)) {
    if (!adapterHasMethod(adapter, method)) continue
    if (!canUseAction(key, hasPermission)) continue
    if (!isRecordEligible(key, record || {})) continue
    actions.push(buildAction(key))
  }

  return sortActions(actions)
}

function areRecordsEligible(action, records = []) {
  return (
    Array.isArray(records) &&
    records.length > 0 &&
    records.every((record) => isRecordEligible(action, record))
  )
}

export function resolveBulkActionItems({
  records = [],
  adapter = {},
  hasPermission = () => true,
} = {}) {
  const actions = []

  for (const [key, method] of Object.entries(BULK_METHODS)) {
    if (!adapterHasMethod(adapter, method)) continue
    if (!canUseAction(key, hasPermission)) continue
    if (!areRecordsEligible(key, records)) continue
    actions.push(buildAction(key))
  }

  return sortActions(actions)
}

export function getEntityWorkflowCapabilities(adapter = {}) {
  return {
    single: Object.fromEntries(
      Object.entries(SINGLE_METHODS).map(([key, method]) => [
        key,
        adapterHasMethod(adapter, method),
      ]),
    ),
    bulk: Object.fromEntries(
      Object.entries(BULK_METHODS).map(([key, method]) => [key, adapterHasMethod(adapter, method)]),
    ),
  }
}
