const STATUS_ALIASES = Object.freeze({
  pending: 'pending-approval',
  pendingapproval: 'pending-approval',
  pending_approval: 'pending-approval',
  inreview: 'pending-approval',
  in_review: 'pending-approval',
  review: 'pending-approval',
  approvedready: 'approved',
  approved_ready: 'approved',
  unpublished: 'draft',
})

const STATUS_LABELS = Object.freeze({
  draft: 'Draft',
  submitted: 'Under Review',
  'pending-approval': 'Pending Approval',
  approved: 'Approved',
  published: 'Published',
  scheduled: 'Scheduled',
  archived: 'Archived',
  expired: 'Expired',
  rejected: 'Rejected',
  deleted: 'Deleted',
  active: 'Active',
  inactive: 'Inactive',
  featured: 'Featured',
  bulletin: 'Bulletin',
  latest: 'Latest',
})

const STATUS_TONES = Object.freeze({
  draft: 'info',
  submitted: 'warning',
  'pending-approval': 'warning',
  approved: 'success',
  published: 'success',
  scheduled: 'warning',
  archived: 'info',
  expired: 'danger',
  rejected: 'danger',
  deleted: 'danger',
  active: 'success',
  inactive: 'info',
  featured: 'warning',
  bulletin: 'success',
  latest: 'warning',
})

export function humanizeKey(value = '') {
  return String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (character) => character.toUpperCase())
}

export function normalizeStatus(value = '') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')

  return STATUS_ALIASES[normalized] || normalized
}

export function getStatusLabel(value = '') {
  const normalized = normalizeStatus(value)
  return STATUS_LABELS[normalized] || humanizeKey(normalized) || 'Unknown'
}

export function getStatusTone(value = '') {
  const normalized = normalizeStatus(value)
  return STATUS_TONES[normalized] || 'info'
}

export function isDateLikeField(field = {}) {
  const key = String(field?.key || '').toLowerCase()
  const label = String(field?.label || '').toLowerCase()
  const type = String(field?.type || field?.component || '').toLowerCase()

  return (
    field?.isDate === true ||
    type === 'date' ||
    key.includes('date') ||
    key.endsWith('at') ||
    label.includes('date') ||
    label.includes('time')
  )
}

export function formatDisplayDate(value, { dateOnly = false } = {}) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'

  return parsed.toLocaleString([], {
    dateStyle: 'medium',
    ...(dateOnly ? {} : { timeStyle: 'short' }),
  })
}

export function resolveFieldValue(record = {}, field = {}) {
  const key = String(field?.key || '')
  const rawValue = record?.[key]

  if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
    return rawValue
  }

  if (key === 'updatedAt') {
    return record?.lastModifiedAt || record?.createdAt || rawValue
  }

  return rawValue
}

export function formatDisplayValue(value, field = {}, locale = 'en') {
  if (value === null || value === undefined || value === '') return '-'

  if (isDateLikeField(field)) {
    return formatDisplayDate(value, {
      dateOnly: field?.component === 'date' || field?.type === 'date',
    })
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : '-'
  }

  if (typeof value === 'object') {
    // Handle bilingual objects like { en: '...', sw: '...' }
    if (value[locale]) return value[locale]
    if (value.en) return value.en
    if (value.sw) return value.sw

    if (value?.name) {
      if (typeof value.name === 'object') {
        return value.name[locale] || value.name.en || value.name.sw || JSON.stringify(value.name)
      }
      return value.name
    }

    if (value?.title) {
      if (typeof value.title === 'object') {
        return (
          value.title[locale] || value.title.en || value.title.sw || JSON.stringify(value.title)
        )
      }
      return value.title
    }

    return JSON.stringify(value)
  }

  return String(value)
}

export function formatNumber(value = 0) {
  const nextValue = Number(value || 0)
  return Number.isFinite(nextValue) ? nextValue.toLocaleString() : '0'
}
