import { getStatusLabel } from '@/utils/adminPresentation'
import { getEffectiveWorkflowStatus } from '@/utils/contentWorkflow'

function pluralize(value, singular, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`
}

export function resolveLocalizedLabel(record = {}, fallback = 'Untitled') {
  return (
    record?.name?.en ||
    record?.name?.sw ||
    record?.title?.en ||
    record?.title?.sw ||
    record?.name ||
    record?.title ||
    record?.systemKey ||
    fallback
  )
}

export function resolveCategoryId(input = {}) {
  return (
    input?.category?.categoryId ||
    input?.categoryId ||
    input?.category?._id ||
    input?.category ||
    ''
  )
}

export function resolveCategoryName(input = {}, fallback = 'Unassigned') {
  return resolveLocalizedLabel(input?.category || input, fallback)
}

export function buildPublicationVisibility(publication = {}, categoryOverride = null) {
  const record = publication && typeof publication === 'object' ? publication : {}
  const category = categoryOverride || record?.category || null
  const publicationStatus = getEffectiveWorkflowStatus(record)
  const categoryStatus = category ? getEffectiveWorkflowStatus(category) : 'draft'
  const categoryIsPublic =
    typeof category?.isPubliclyVisible === 'boolean'
      ? category.isPubliclyVisible
      : categoryStatus === 'published' && category !== null

  if (!category) {
    return {
      tone: 'danger',
      label: 'Blocked',
      description: 'This publication has no assigned category.',
      isPublic: false,
    }
  }

  if (publicationStatus !== 'published') {
    return {
      tone: 'info',
      label: 'Internal Only',
      description: `Publication is ${getStatusLabel(publicationStatus).toLowerCase()}.`,
      isPublic: false,
    }
  }

  if (!categoryIsPublic) {
    return {
      tone: 'warning',
      label: 'Blocked by Category',
      description:
        categoryStatus === 'approved'
          ? 'This publication is ready, but its category is not public yet.'
          : `Category is ${getStatusLabel(categoryStatus).toLowerCase()}.`,
      isPublic: false,
    }
  }

  return {
    tone: 'success',
    label: 'Public',
    description: 'Visible on the public website under its category.',
    isPublic: true,
  }
}

export function buildCategoryVisibility(category = {}) {
  const record = category && typeof category === 'object' ? category : {}
  const status = getEffectiveWorkflowStatus(record)
  const publishedCount = Number(record?.publishedPublicationCount || 0)
  const isManualPublication = record?.isManualPublication === true
  const isPublic =
    record?.isPubliclyVisible === true || (status === 'published' && isManualPublication)

  if (status !== 'published') {
    return {
      tone: 'info',
      label: 'Internal Only',
      description: `Category is ${getStatusLabel(status).toLowerCase()}.`,
      isPublic: false,
    }
  }

  if (isPublic && !publishedCount && isManualPublication) {
    return {
      tone: 'success',
      label: 'Public',
      description:
        'Visible on the website through direct category publishing, even though no publication under it is currently public.',
      isPublic: true,
    }
  }

  if (!isPublic && !publishedCount) {
    return {
      tone: 'warning',
      label: 'Awaiting Content',
      description:
        'This category is approved internally, but it will stay off the website until it is published directly or one of its publications goes live.',
      isPublic: false,
    }
  }

  return {
    tone: 'success',
    label: 'Public',
    description: `Visible on the website with ${pluralize(publishedCount, 'published publication')}.`,
    isPublic: true,
  }
}

export function sortByRecent(records = []) {
  return [...(Array.isArray(records) ? records : [])].sort((left, right) => {
    const leftDate = new Date(
      left?.lastModifiedAt || left?.updatedAt || left?.createdAt || 0,
    ).getTime()
    const rightDate = new Date(
      right?.lastModifiedAt || right?.updatedAt || right?.createdAt || 0,
    ).getTime()
    return rightDate - leftDate
  })
}

export function countByStatus(records = []) {
  return (Array.isArray(records) ? records : []).reduce((accumulator, record) => {
    const status = getEffectiveWorkflowStatus(record)
    accumulator[status] = (accumulator[status] || 0) + 1
    return accumulator
  }, {})
}

export function buildPublicationSummary(publications = []) {
  const counts = countByStatus(publications)
  const list = Array.isArray(publications) ? publications : []

  return {
    total: list.length,
    draft: counts.draft || 0,
    submitted: counts.submitted || 0,
    approved: counts.approved || 0,
    published: counts.published || 0,
    unpublished: counts.unpublished || 0,
    blockedByCategory: list.filter((publication) => {
      const visibility = buildPublicationVisibility(publication)
      return visibility.label === 'Blocked by Category'
    }).length,
  }
}

export function buildCategorySummary(categories = [], publications = []) {
  const counts = countByStatus(categories)
  const list = Array.isArray(categories) ? categories : []

  return {
    total: list.length,
    draft: counts.draft || 0,
    submitted: counts.submitted || 0,
    approved: counts.approved || 0,
    published: counts.published || 0,
    unpublished: counts.unpublished || 0,
    rejected: counts.rejected || 0,
    empty: list.filter((category) => Number(category?.publicationCount || 0) === 0).length,
    live: list.filter((category) => category?.isPubliclyVisible === true).length,
    totalLinkedPublications: (Array.isArray(publications) ? publications : []).length,
  }
}

export function matchesSearch(record = {}, searchTerm = '') {
  const term = String(searchTerm || '')
    .trim()
    .toLowerCase()
  if (!term) return true

  const searchable = [
    resolveLocalizedLabel(record, ''),
    record?.systemKey,
    record?.categoryId,
    record?.publicationId,
    record?.description?.en,
    record?.description?.sw,
    resolveCategoryName(record, ''),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return searchable.includes(term)
}
