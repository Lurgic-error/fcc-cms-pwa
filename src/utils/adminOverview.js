import { getEffectiveWorkflowStatus } from './contentWorkflow'
import { getStatusLabel, getStatusTone, humanizeKey } from './adminPresentation'

const DEFAULT_STATUS_ORDER = Object.freeze([
  'draft',
  'pending-approval',
  'approved',
  'published',
  'scheduled',
  'archived',
  'expired',
  'rejected',
])

const DEFAULT_DATE_KEYS = Object.freeze([
  'createdAt',
  'lastModifiedAt',
  'updatedAt',
  'publishedAt',
  'lastVisit',
  'issueDate',
  'validFrom',
  'startDate',
])

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeMetric(key, value, helper = '') {
  return {
    key,
    label: getStatusLabel(key),
    value,
    helper,
    tone: getStatusTone(key),
  }
}

export function inferTitle(record = {}, config = {}) {
  const candidates = [
    record?.name?.en,
    record?.name?.sw,
    record?.title?.en,
    record?.title?.sw,
    record?.name,
    record?.title,
    record?.systemKey,
    record?.slug,
    record?.code,
    record?.[config.idKey],
  ]

  return candidates.find(Boolean) || config.singular || 'Record'
}

export function inferSupportedStatuses(config = {}, records = []) {
  const fromForm = safeArray(config?.formSchema)
    .find((field) => ['publicationStatus', 'status'].includes(field?.key))
    ?.options?.map((option) => option?.value)
    ?.filter(Boolean)
    ?.map((value) => String(value).trim().toLowerCase())

  const fromRecords = safeArray(records)
    .map((record) => getEffectiveWorkflowStatus(record))
    .filter(Boolean)

  return Array.from(new Set([...(fromForm || []), ...fromRecords]))
}

export function inferDateField(records = [], config = {}) {
  if (config?.overview?.trendField) return config.overview.trendField

  const sample = safeArray(records)[0] || {}
  return DEFAULT_DATE_KEYS.find((key) => sample?.[key])
}

export function buildStatusCounts(records = []) {
  return safeArray(records).reduce((accumulator, record) => {
    const status = getEffectiveWorkflowStatus(record)
    if (!status) return accumulator
    accumulator[status] = (accumulator[status] || 0) + 1
    return accumulator
  }, {})
}

export function buildOverviewMetrics(records = [], pagination = {}, config = {}) {
  const list = safeArray(records)
  const statusCounts = buildStatusCounts(list)
  const supportedStatuses = inferSupportedStatuses(config, list)
  const metrics = [
    {
      key: 'total',
      label: 'Total',
      value: Number(pagination?.total || list.length || 0),
      helper:
        Number(pagination?.total || 0) > list.length
          ? 'Across all matching records'
          : 'Current result set',
      tone: 'primary',
    },
  ]

  DEFAULT_STATUS_ORDER.forEach((status) => {
    if (!supportedStatuses.includes(status) && !statusCounts[status]) return
    metrics.push(normalizeMetric(status, statusCounts[status] || 0))
  })

  const flagMetrics = [
    {
      key: 'featured',
      label: 'Featured',
      value: list.filter((record) => record?.isFeatured === true).length,
      tone: 'warning',
    },
    {
      key: 'bulletin',
      label: 'Bulletin',
      value: list.filter((record) => record?.isBulletin === true).length,
      tone: 'success',
    },
    {
      key: 'latest',
      label: 'Latest',
      value: list.filter((record) => record?.isLatest === true).length,
      tone: 'warning',
    },
  ]

  flagMetrics.forEach((metric) => {
    if (!metric.value) return
    metrics.push(metric)
  })

  return metrics
}

export function buildStatusDistribution(records = [], config = {}) {
  const statusCounts = buildStatusCounts(records)
  const supportedStatuses = inferSupportedStatuses(config, records)
  const statuses = DEFAULT_STATUS_ORDER.filter(
    (status) => supportedStatuses.includes(status) || statusCounts[status],
  )

  return statuses.map((status) => ({
    key: status,
    label: getStatusLabel(status),
    value: statusCounts[status] || 0,
    tone: getStatusTone(status),
  }))
}

export function buildTrendSeries(records = [], config = {}) {
  const dateField = inferDateField(records, config)
  if (!dateField) return []

  const grouped = safeArray(records).reduce((accumulator, record) => {
    const value = record?.[dateField]
    if (!value) return accumulator

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return accumulator

    const bucket = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}`
    accumulator[bucket] = (accumulator[bucket] || 0) + 1
    return accumulator
  }, {})

  return Object.entries(grouped)
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-6)
    .map(([bucket, value]) => {
      const [year, month] = bucket.split('-').map(Number)
      const label = new Date(year, month - 1, 1).toLocaleString([], {
        month: 'short',
        year: 'numeric',
      })

      return { label, value }
    })
}

export function buildRecentActivity(records = [], config = {}) {
  const dateField = inferDateField(records, config)

  return safeArray(records)
    .filter((record) => (dateField ? record?.[dateField] : true))
    .sort((left, right) => {
      if (!dateField) return 0
      return new Date(right?.[dateField]).getTime() - new Date(left?.[dateField]).getTime()
    })
    .slice(0, 5)
    .map((record) => ({
      title: inferTitle(record, config),
      status: getEffectiveWorkflowStatus(record),
      timestamp: dateField ? record?.[dateField] : null,
      meta:
        record?.category?.name?.en ||
        record?.category?.name ||
        record?.eventType ||
        record?.validityType ||
        humanizeKey(config.key || config.label || 'module'),
    }))
}
