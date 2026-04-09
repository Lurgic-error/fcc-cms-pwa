function normalizeItem(item) {
  return item && typeof item === 'object' ? item : {}
}

function toDate(value) {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function getEffectiveWorkflowStatus(item = {}) {
  const record = normalizeItem(item)
  const effectiveStatus = String(record.effectiveStatus || '')
    .trim()
    .toLowerCase()
  if (effectiveStatus) return effectiveStatus

  if (record.isDeleted === true || record.deleted === true) return 'deleted'
  if (record.isArchived === true || record.archived === true) return 'archived'
  if (record.published === true) return 'published'
  if (record.published === false) return 'unpublished'

  const publicationStatus = String(record.publicationStatus || record.status || '')
    .trim()
    .toLowerCase()

  return publicationStatus || 'draft'
}

export function getWorkflowSchedule(item = {}) {
  const record = normalizeItem(item)
  const scheduledPublishAt = toDate(record.scheduledPublishAt)
  const scheduledUnpublishAt = toDate(
    record.scheduledUnpublishAt || record.unpublishAt || record.expireAt,
  )

  return {
    scheduledPublishAt,
    scheduledUnpublishAt,
    hasPublishSchedule:
      Boolean(scheduledPublishAt) &&
      record.publishScheduleCanceled !== true &&
      record.scheduledPublishCanceled !== true,
    hasUnpublishSchedule:
      Boolean(scheduledUnpublishAt) &&
      record.unpublishScheduleCanceled !== true &&
      record.scheduledUnpublishCanceled !== true,
  }
}

export function withWorkflowState(item = {}) {
  const record = normalizeItem(item)
  const effectiveStatus = getEffectiveWorkflowStatus(record)
  const schedule = getWorkflowSchedule(record)
  const isDeleted =
    record.isDeleted === true || record.deleted === true || effectiveStatus === 'deleted'
  const isArchived =
    record.isArchived === true || record.archived === true || effectiveStatus === 'archived'

  return {
    ...record,
    effectiveStatus,
    isDeleted,
    isArchived,
    ...schedule,
    isLive: record.isLive === true || effectiveStatus === 'published',
    isScheduled:
      record.isScheduled === true || effectiveStatus === 'scheduled' || schedule.hasPublishSchedule,
    isExpired: record.isExpired === true || effectiveStatus === 'expired',
    isPubliclyVisible:
      record.isPubliclyVisible === true && !isArchived && !isDeleted
        ? true
        : effectiveStatus === 'published' && !isArchived && !isDeleted,
  }
}

export function withWorkflowStateList(list = []) {
  return (Array.isArray(list) ? list : []).map((item) => withWorkflowState(item))
}
