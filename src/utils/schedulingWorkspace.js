export function formatScheduleDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString()
}

export function getScheduleActionLabel(jobName = '') {
  return jobName === 'unpublishContent' ? 'Unpublish' : 'Publish'
}

export function getScheduleStatusType(status = '') {
  const value = String(status || '').toLowerCase()
  if (value === 'active') return 'success'
  if (value === 'paused') return 'warning'
  if (value === 'cancelled') return 'danger'
  if (value === 'completed') return 'info'
  return ''
}

export function resolveScheduleTargetLabel(schedule = {}) {
  const type = schedule?.data?.contentType || '-'
  const action =
    schedule?.data?.action || (schedule?.jobName === 'unpublishContent' ? 'unpublish' : 'publish')

  return `${type} / ${action}`
}

export function resolveScheduleContentId(schedule = {}) {
  return schedule?.data?.contentId || '-'
}
