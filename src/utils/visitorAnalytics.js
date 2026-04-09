function toDateKey(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function normalizeText(value = '') {
  return String(value || '').trim()
}

function shortenLabel(value = '', maxLength = 26) {
  const label = normalizeText(value)
  if (!label) return ''
  if (label.length <= maxLength) return label
  return `${label.slice(0, Math.max(maxLength - 1, 1))}…`
}

export function shortenPath(path = '', maxLength = 28) {
  const normalized = normalizeText(path)

  if (!normalized || normalized === '/') return 'Homepage'
  return shortenLabel(normalized, maxLength)
}

export function extractReferrerLabel(referrer = '') {
  const normalized = normalizeText(referrer)

  if (!normalized) return 'Direct'

  try {
    const hostname = new URL(normalized).hostname.replace(/^www\./, '')
    return hostname || 'Direct'
  } catch {
    return shortenLabel(normalized.replace(/^www\./, ''), 24) || 'Direct'
  }
}

export function buildSummaryWindowSeries(summary = {}) {
  return [
    {
      key: 'today',
      label: 'Today',
      value: Number(summary?.todayVisitors || 0),
    },
    {
      key: 'yesterday',
      label: 'Yesterday',
      value: Number(summary?.yesterdayVisitors || 0),
    },
    {
      key: 'week',
      label: 'This Week',
      value: Number(summary?.thisWeekVisitors || 0),
    },
    {
      key: 'month',
      label: 'This Month',
      value: Number(summary?.thisMonthVisitors || 0),
    },
  ]
}

export function buildVisitTrendSeries(recentActivity = [], days = 14) {
  const safeDays = Math.min(Math.max(Number(days) || 14, 3), 30)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const buckets = []

  for (let offset = safeDays - 1; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)

    buckets.push({
      key: toDateKey(date),
      date,
      value: 0,
    })
  }

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]))

  ;(recentActivity || []).forEach((item) => {
    const key = toDateKey(item?.visitedAt)
    if (!key) return

    const bucket = bucketMap.get(key)
    if (!bucket) return

    bucket.value += 1
  })

  return buckets.map((bucket) => ({
    key: bucket.key,
    label: bucket.date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
    value: bucket.value,
  }))
}

export function buildTopPagesSeries(topPages = [], { limit = 6, metric = 'views' } = {}) {
  return (topPages || []).slice(0, limit).map((item, index) => ({
    key: item?.path || item?._id || `page-${index}`,
    label: shortenPath(item?.path),
    value: Number(item?.[metric] || 0),
    fullLabel: normalizeText(item?.path) || 'Homepage',
    uniqueVisitors: Number(item?.uniqueVisitors || 0),
  }))
}

export function buildReferrerSeries(topReferrers = [], { limit = 5 } = {}) {
  return (topReferrers || []).slice(0, limit).map((item, index) => ({
    key: item?.referrer || `referrer-${index}`,
    label: extractReferrerLabel(item?.referrer),
    value: Number(item?.visits || 0),
    fullLabel: normalizeText(item?.referrer) || 'Direct',
  }))
}

export function buildLocaleSeries(topLocales = [], { limit = 6 } = {}) {
  return (topLocales || []).slice(0, limit).map((item, index) => ({
    key: item?.locale || `locale-${index}`,
    label: normalizeText(item?.locale).toUpperCase() || 'Unknown',
    value: Number(item?.visits || 0),
  }))
}

export function buildReturnVisitorSeries(visitors = []) {
  const repeat = (visitors || []).filter((item) => Number(item?.visitCount || 0) > 1).length
  const firstTime = Math.max((visitors || []).length - repeat, 0)

  return [
    { key: 'repeat', label: 'Repeat', value: repeat },
    { key: 'new', label: 'New', value: firstTime },
  ]
}

export function buildActiveSessionSeries(visitors = []) {
  const active = (visitors || []).filter((item) => item?.isActive === true).length
  const inactive = Math.max((visitors || []).length - active, 0)

  return [
    { key: 'active', label: 'Active', value: active },
    { key: 'inactive', label: 'Inactive', value: inactive },
  ]
}
