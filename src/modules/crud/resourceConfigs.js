import {
  articlesAPI,
  assetsAPI,
  commissionAPI,
  commissionersAPI,
  committeesAPI,
  dashboardAPI,
  directoratesAPI,
  eventsAPI,
  inquiriesAPI,
  officesAPI,
  partnersAPI,
  photosAPI,
  publicationsAPI,
  questionsAPI,
  rolesAPI,
  sectionsAPI,
  servicesAPI,
  socialsAPI,
  subscribersAPI,
  unitsAPI,
  usersAPI,
  videosAPI,
  visitorsAPI,
} from '@/api'
import {
  buildAddressPayload,
  buildContactsPayload,
  buildDesignationValue,
  buildLocalizedValue,
  buildMediaValue,
  buildPersonPayload,
  COMMISSIONER_DESIGNATION_OPTIONS,
  extractAddressForm,
  extractContactsForm,
  extractMediaFieldValue,
  extractMediaUrl,
  extractPersonForm,
  toDesignationKey,
  toLocalizedParts,
} from './structuralContentForms'
import { getStatusLabel } from '@/utils/adminPresentation'

function toISODate(value) {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

function joinNames(roles = []) {
  if (!Array.isArray(roles)) return '-'
  return roles
    .map((role) => role?.name || role)
    .filter(Boolean)
    .join(', ')
}

function parseCSV(value = '') {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeTagList(value = []) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean)
  }

  return parseCSV(value)
}

function normalizeSystemKey(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function resolveEntityOptionValue(record = {}, keys = []) {
  return (
    keys.map((key) => record?.[key]).find(Boolean) ||
    record?._id ||
    record?.id ||
    record?.value ||
    ''
  )
}

function resolveEntityOptionLabel(record = {}) {
  return (
    record?.name?.en ||
    record?.name?.sw ||
    record?.title?.en ||
    record?.title?.sw ||
    record?.name ||
    record?.title ||
    record?.systemKey ||
    record?.code ||
    record?.slug ||
    record?.email ||
    'Untitled'
  )
}

function mapEntityOptions(list = [], idKeys = []) {
  return (Array.isArray(list) ? list : []).map((record) => ({
    value: resolveEntityOptionValue(record, idKeys),
    label: resolveEntityOptionLabel(record),
  }))
}

function resolveWorkflowStatus(record = {}) {
  return record?.effectiveStatus || record?.publicationStatus || record?.status || ''
}

function resolveCategoryOptionLabel(record = {}) {
  const label = resolveEntityOptionLabel(record)
  const status = getStatusLabel(resolveWorkflowStatus(record))
  const publicationCount = Number(record?.publicationCount || 0)
  const suffix = publicationCount
    ? `${publicationCount} publication${publicationCount === 1 ? '' : 's'}`
    : 'No publications yet'

  return [label, status, suffix].filter(Boolean).join(' · ')
}

async function loadPublicationCategoryOptions() {
  const response = await publicationsAPI.listPublicationCategories({ limit: 200 })
  return (response?.categories || response?.items || [])
    .map((record) => ({
      value: resolveEntityOptionValue(record, ['_id', 'categoryId']),
      label: resolveCategoryOptionLabel(record),
    }))
    .sort((left, right) => left.label.localeCompare(right.label))
}

async function loadDirectorateOptions() {
  const response = await directoratesAPI.listDirectorates({ limit: 200 })
  return mapEntityOptions(response?.directorates || response?.items || [], ['_id', 'directorateId'])
}

async function loadSectionOptions() {
  const response = await sectionsAPI.listSections({ limit: 200 })
  return mapEntityOptions(response?.sections || response?.items || [], ['_id', 'sectionId'])
}

async function loadUnitOptions() {
  const response = await unitsAPI.listUnits({ limit: 200 })
  return mapEntityOptions(response?.units || response?.items || [], ['_id', 'unitId'])
}

function toISODateTime(value) {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 16).replace('T', ' ')
}

function toISOTime(value) {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    const rawValue = String(value || '').trim()
    return /^\d{2}:\d{2}/.test(rawValue) ? rawValue.slice(0, 5) : ''
  }
  return parsed.toISOString().slice(11, 16)
}

function toLocalizedPreview(value) {
  const source =
    value && typeof value === 'object' && !Array.isArray(value) && value.description
      ? value.description
      : value
  const localized = toLocalizedParts(source)
  return localized.en || localized.sw || '-'
}

function toLocalizedCollectionForm(items = []) {
  if (!Array.isArray(items)) return []

  return items
    .map((item) => {
      const localized = toLocalizedParts(item)
      if (!localized.en && !localized.sw) return null
      return localized
    })
    .filter(Boolean)
}

function buildLocalizedCollection(items = []) {
  if (!Array.isArray(items)) return []

  return items.map((item) => buildLocalizedValue(item?.en, item?.sw)).filter(Boolean)
}

function toLocalizedObject(value = {}) {
  const localized = toLocalizedParts(value)
  return {
    en: localized.en || '',
    sw: localized.sw || '',
  }
}

function toLocalizedPreviewText(value = {}) {
  const localized = toLocalizedObject(value)
  return localized.en || localized.sw || '-'
}

function toFullName(person = {}) {
  return (
    person?.fullName ||
    [person?.prefix, person?.firstName, person?.middleName, person?.surname || person?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    '-'
  )
}

function createEventOccurrenceFormItem() {
  return {
    startDate: '',
    endDate: '',
    venueName: '',
    venueLocation: '',
    isFinal: false,
  }
}

function toEventOccurrenceFormItems(items = []) {
  const occurrences = Array.isArray(items) ? items : []

  if (!occurrences.length) {
    return [createEventOccurrenceFormItem()]
  }

  return occurrences.map((item, index) => ({
    startDate: toISODate(item?.startDate),
    endDate: toISODate(item?.endDate || item?.startDate),
    venueName: item?.venue?.name || '',
    venueLocation: item?.venue?.location || '',
    isFinal: Boolean(item?.isFinal || index === occurrences.length - 1),
  }))
}

function toEventScheduleFormItems(record = {}) {
  const schedule =
    (Array.isArray(record?.schedule) && record.schedule.length
      ? record.schedule
      : record?.occurrences?.[0]?.schedule) || []

  return schedule.map((item) => ({
    title: item?.title || '',
    description: item?.description || '',
    startTime: toISOTime(item?.startTime),
    endTime: toISOTime(item?.endTime),
    speaker: item?.speaker?.name || item?.speaker || '',
  }))
}

function toEventSponsorFormItems(items = []) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    name: item?.name || '',
    contribution: item?.contribution || item?.description || '',
    website: item?.website || item?.url || '',
  }))
}

function toEventPeopleFormItems(items = []) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    name: item?.name || '',
    title: item?.title || '',
    organization: item?.organization || '',
    notes: item?.notes || item?.description || '',
  }))
}

function buildEventVenue(item = {}) {
  const name = String(item?.venueName || '').trim()
  const location = String(item?.venueLocation || '').trim()

  if (!name && !location) return null

  return {
    ...(name ? { name } : {}),
    ...(location ? { location } : {}),
  }
}

function buildEventScheduleItems(items = [], anchorDate = '') {
  return (Array.isArray(items) ? items : [])
    .map((item) => {
      const title = String(item?.title || '').trim()
      const description = String(item?.description || '').trim()
      const startTime = String(item?.startTime || '').trim()
      const endTime = String(item?.endTime || '').trim()
      const speaker = String(item?.speaker || '').trim()

      if (!title || !startTime || !endTime) return null

      const startDateTime = anchorDate ? `${anchorDate}T${startTime}:00` : startTime
      const endDateTime = anchorDate ? `${anchorDate}T${endTime}:00` : endTime

      return {
        title,
        ...(description ? { description } : {}),
        startTime: startDateTime,
        endTime: endDateTime,
        ...(speaker ? { speaker: { name: speaker } } : {}),
      }
    })
    .filter(Boolean)
}

function buildEventSponsorItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item) => {
      const name = String(item?.name || '').trim()
      const contribution = String(item?.contribution || '').trim()
      const website = String(item?.website || '').trim()

      if (!name) return null

      return {
        name,
        ...(contribution ? { contribution } : {}),
        ...(website ? { website } : {}),
      }
    })
    .filter(Boolean)
}

function buildEventPeopleItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item) => {
      const name = String(item?.name || '').trim()
      const title = String(item?.title || '').trim()
      const organization = String(item?.organization || '').trim()
      const notes = String(item?.notes || '').trim()

      if (!name) return null

      return {
        name,
        ...(title ? { title } : {}),
        ...(organization ? { organization } : {}),
        ...(notes ? { notes } : {}),
      }
    })
    .filter(Boolean)
}

function buildEventOccurrences(items = [], scheduleItems = []) {
  const occurrences = (Array.isArray(items) ? items : [])
    .map((item, index, source) => {
      const startDate = toISODate(item?.startDate)
      const endDate = toISODate(item?.endDate || item?.startDate)

      if (!startDate || !endDate) return null

      const venue = buildEventVenue(item)

      return {
        startDate,
        endDate,
        ...(venue ? { venue } : {}),
        ...(index === 0 && scheduleItems.length ? { schedule: scheduleItems } : {}),
        isFinal: Boolean(item?.isFinal || index === source.length - 1),
      }
    })
    .filter(Boolean)

  return occurrences
}

function formatEventOccurrencesSummary(row = {}) {
  const occurrences = Array.isArray(row?.occurrences) ? row.occurrences : []
  if (!occurrences.length) return '-'

  return occurrences
    .map((occurrence) => {
      const start = toISODate(occurrence?.startDate)
      const end = toISODate(occurrence?.endDate)
      const venueName = occurrence?.venue?.name || occurrence?.venue?.location

      return [start, end && end !== start ? `to ${end}` : '', venueName ? `at ${venueName}` : '']
        .filter(Boolean)
        .join(' ')
    })
    .join(' | ')
}

function formatEventPeopleSummary(items = []) {
  if (!Array.isArray(items) || !items.length) return '-'

  return items
    .map((item) => item?.name || item?.title || item?.organization)
    .filter(Boolean)
    .join(', ')
}

function pickDefinedEntries(entries = []) {
  return Object.fromEntries(entries.filter(([, value]) => typeof value === 'function'))
}

function wrapApiMethod(method, mapper = (value) => value) {
  return typeof method === 'function' ? mapper(method) : undefined
}

function buildGenericWorkflowAdapter(api = {}) {
  return pickDefinedEntries([
    ['listPublished', api.listPublished],
    ['listArchived', api.listArchived],
    ['submit', api.submit],
    ['approve', api.approve],
    [
      'reject',
      wrapApiMethod(
        api.reject,
        (method) =>
          (id, { reason } = {}) =>
            method(id, reason),
      ),
    ],
    ['publish', api.publish],
    ['unpublish', api.unpublish],
    [
      'schedulePublish',
      wrapApiMethod(
        api.schedulePublish,
        (method) =>
          (id, payload = {}) =>
            method(id, payload),
      ),
    ],
    [
      'scheduleUnpublish',
      wrapApiMethod(
        api.scheduleUnpublish,
        (method) =>
          (id, payload = {}) =>
            method(id, payload),
      ),
    ],
    ['cancelPublishSchedule', api.cancelPublishSchedule],
    ['cancelUnpublishSchedule', api.cancelUnpublishSchedule],
    [
      'archive',
      wrapApiMethod(
        api.archive,
        (method) =>
          (id, { reason } = {}) =>
            method(id, reason),
      ),
    ],
    ['restore', api.restore],
    ['restoreArchived', api.restoreArchived],
    [
      'softDelete',
      wrapApiMethod(
        api.softDelete,
        (method) =>
          (id, { reason } = {}) =>
            method(id, reason),
      ),
    ],
    ['bulkPublish', api.bulkPublish],
    ['bulkUnpublish', api.bulkUnpublish],
    [
      'bulkSchedulePublish',
      wrapApiMethod(
        api.bulkSchedulePublish,
        (method) =>
          (payload = {}) =>
            method(payload),
      ),
    ],
    [
      'bulkScheduleUnpublish',
      wrapApiMethod(
        api.bulkScheduleUnpublish,
        (method) =>
          (payload = {}) =>
            method(payload),
      ),
    ],
    [
      'bulkCancelPublishSchedule',
      wrapApiMethod(
        api.bulkCancelPublishSchedule,
        (method) =>
          (payload = {}) =>
            method(payload),
      ),
    ],
    [
      'bulkCancelUnpublishSchedule',
      wrapApiMethod(
        api.bulkCancelUnpublishSchedule,
        (method) =>
          (payload = {}) =>
            method(payload),
      ),
    ],
    [
      'bulkArchive',
      wrapApiMethod(
        api.bulkArchive,
        (method) =>
          (payload = {}) =>
            method(payload),
      ),
    ],
    [
      'bulkRestore',
      wrapApiMethod(
        api.bulkRestore,
        (method) =>
          (payload = {}) =>
            method(payload),
      ),
    ],
    [
      'bulkRestoreArchived',
      wrapApiMethod(
        api.bulkRestoreArchived,
        (method) =>
          (payload = {}) =>
            method(payload),
      ),
    ],
    [
      'bulkSoftDelete',
      wrapApiMethod(
        api.bulkSoftDelete,
        (method) =>
          (payload = {}) =>
            method(payload),
      ),
    ],
    [
      'bulkRemove',
      wrapApiMethod(
        api.bulkRemove,
        (method) =>
          (payload = {}) =>
            method(payload),
      ),
    ],
  ])
}

function buildStructureDetailFields(roleLabel = 'Manager') {
  return [
    { key: 'name', label: 'Name', formatter: (row) => toLocalizedPreview(row?.name) },
    { key: 'code', label: 'Code' },
    { key: 'slug', label: 'Slug' },
    {
      key: 'coverImage',
      label: 'Cover Image',
      kind: 'image',
      formatter: (row) => extractMediaUrl(row?.coverImage || row?.image),
    },
    {
      key: 'description',
      label: 'Description',
      formatter: (row) => toLocalizedPreview(row?.description),
    },
    {
      key: 'functionalities',
      label: 'Functions',
      formatter: (row) =>
        Array.isArray(row?.functionalities || row?.functions)
          ? (row.functionalities || row.functions)
              .map((item) => toLocalizedPreview(item))
              .join(', ')
          : '-',
    },
    { key: 'slogan', label: 'Slogan', formatter: (row) => toLocalizedPreview(row?.slogan) },
    { key: 'cta', label: 'Call To Action', formatter: (row) => toLocalizedPreview(row?.cta) },
    {
      key: 'lead',
      label: roleLabel,
      formatter: (row) => toFullName(row?.director || row?.manager),
    },
    {
      key: 'leadProfilePicture',
      label: `${roleLabel} Profile Picture`,
      kind: 'image',
      formatter: (row) =>
        extractMediaUrl(row?.director?.profilePicture || row?.manager?.profilePicture),
    },
    {
      key: 'statement',
      label: `${roleLabel} Statement`,
      formatter: (row) => toLocalizedPreview(row?.directorStatement || row?.managerStatement),
    },
    { key: 'publicationStatus', label: 'Status' },
  ]
}

function buildStructureFormSchema({
  rolePrefix,
  roleTitle,
  includeDirectorate = false,
  includeOfficeType = false,
  includeAddress = false,
  includeContacts = false,
  roleRequiredWhen = null,
  profilePictureRequiredWhen = null,
  coverImageRequiredWhen = null,
}) {
  const schema = [
    {
      component: 'section',
      label: 'Identity',
      description: 'Bilingual title, identifiers, and visual treatment for the public website.',
    },
    { key: 'nameEn', label: 'Name (English)', required: true, component: 'input' },
    { key: 'nameSw', label: 'Name (Swahili)', required: true, component: 'input' },
    { key: 'code', label: 'Code', component: 'input' },
    { key: 'slug', label: 'Slug', component: 'input' },
    {
      key: 'coverImage',
      label: 'Cover Image',
      component: 'file-upload',
      fullWidth: true,
      requiredWhen: coverImageRequiredWhen,
      multiple: false,
      limit: 1,
      accept: 'image/*',
      uploadTitle: 'Drop a cover image here or click to choose one',
      uploadHint: 'Use a landscape-oriented image for headers and cards.',
      tip: 'PNG and JPG files are accepted.',
    },
    {
      component: 'section',
      label: 'Content',
      description: 'Long-form descriptions, functions, CTA copy, and organizational messaging.',
    },
    {
      key: 'descriptionEn',
      label: 'Description (English)',
      component: 'textarea',
      rows: 5,
      fullWidth: true,
    },
    {
      key: 'descriptionSw',
      label: 'Description (Swahili)',
      component: 'textarea',
      rows: 5,
      fullWidth: true,
    },
    {
      key: 'functionalities',
      label: 'Functions',
      component: 'repeatable-list',
      fullWidth: true,
      addLabel: 'Add function',
      itemTitle: 'Function',
      itemDescription: 'Add the English and Swahili copy for each function.',
      itemSchema: [
        {
          key: 'en',
          label: 'Function (English)',
          component: 'textarea',
          rows: 3,
          placeholder: 'Describe this function in English',
        },
        {
          key: 'sw',
          label: 'Function (Swahili)',
          component: 'textarea',
          rows: 3,
          placeholder: 'Describe this function in Swahili',
        },
      ],
    },
    { key: 'ctaEn', label: 'CTA (English)', component: 'textarea', rows: 3, fullWidth: true },
    { key: 'ctaSw', label: 'CTA (Swahili)', component: 'textarea', rows: 3, fullWidth: true },
    { key: 'sloganEn', label: 'Slogan (English)', component: 'textarea', rows: 3, fullWidth: true },
    { key: 'sloganSw', label: 'Slogan (Swahili)', component: 'textarea', rows: 3, fullWidth: true },
    {
      component: 'section',
      label: roleTitle,
      description: `Profile, statement, and media fields for the ${roleTitle.toLowerCase()}.`,
    },
    { key: `${rolePrefix}Prefix`, label: `${roleTitle} Prefix`, component: 'input' },
    {
      key: `${rolePrefix}FirstName`,
      label: `${roleTitle} First Name`,
      component: 'input',
      requiredWhen: roleRequiredWhen,
    },
    { key: `${rolePrefix}MiddleName`, label: `${roleTitle} Middle Name`, component: 'input' },
    {
      key: `${rolePrefix}Surname`,
      label: `${roleTitle} Surname`,
      component: 'input',
      requiredWhen: roleRequiredWhen,
    },
    { key: `${rolePrefix}Email`, label: `${roleTitle} Email`, component: 'input', type: 'email' },
    { key: `${rolePrefix}PhoneNumber`, label: `${roleTitle} Phone Number`, component: 'input' },
    {
      key: `${rolePrefix}ProfilePicture`,
      label: `${roleTitle} Profile Picture`,
      component: 'file-upload',
      requiredWhen: profilePictureRequiredWhen,
      multiple: false,
      limit: 1,
      accept: 'image/*',
      uploadTitle: `Drop the ${roleTitle.toLowerCase()} profile image here or click to choose one`,
      uploadHint: 'Use a clear portrait image for leadership cards and detail pages.',
      tip: 'PNG and JPG files are accepted.',
    },
    { key: `${rolePrefix}JobEn`, label: `${roleTitle} Job Title (English)`, component: 'input' },
    { key: `${rolePrefix}JobSw`, label: `${roleTitle} Job Title (Swahili)`, component: 'input' },
    {
      key: `${rolePrefix}StatementEn`,
      label: `${roleTitle} Statement (English)`,
      component: 'textarea',
      rows: 4,
      fullWidth: true,
    },
    {
      key: `${rolePrefix}StatementSw`,
      label: `${roleTitle} Statement (Swahili)`,
      component: 'textarea',
      rows: 4,
      fullWidth: true,
    },
  ]

  if (includeDirectorate) {
    schema.splice(5, 0, {
      key: 'directorate',
      label: 'Directorate',
      required: true,
      component: 'entity-select',
      placeholder: 'Select directorate',
      helpText: 'Choose the parent directorate by name. The related ID is submitted automatically.',
      loadOptions: loadDirectorateOptions,
    })
  }

  if (includeOfficeType) {
    schema.splice(5, 0, {
      key: 'type',
      label: 'Type',
      required: true,
      component: 'select',
      options: OFFICE_TYPE_OPTIONS,
    })
  }

  if (includeAddress) {
    schema.push(
      {
        component: 'section',
        label: 'Address',
        description: 'Regional office location and mailing details.',
      },
      { key: 'region', label: 'Region', component: 'input' },
      { key: 'district', label: 'District', component: 'input' },
      { key: 'ward', label: 'Ward', component: 'input' },
      { key: 'street', label: 'Street', component: 'input' },
      { key: 'building', label: 'Building', component: 'input' },
      { key: 'postalAddress', label: 'Postal Address', component: 'input', fullWidth: true },
      {
        key: 'physicalAddress',
        label: 'Physical Address',
        component: 'textarea',
        rows: 3,
        fullWidth: true,
      },
    )
  }

  if (includeContacts) {
    schema.push(
      {
        component: 'section',
        label: 'Contacts',
        description: 'Direct communication channels displayed on the public website.',
      },
      { key: 'phoneNumber', label: 'Phone Number', component: 'input' },
      { key: 'fax', label: 'Fax', component: 'input' },
      { key: 'email', label: 'Email', component: 'input', type: 'email' },
    )
  }

  schema.push(
    {
      component: 'section',
      label: 'Publishing',
      description: 'Review workflow state and public website visibility before saving.',
    },
    {
      key: 'publicationStatus',
      label: 'Status',
      component: 'select',
      options: STATUS_OPTIONS,
    },
  )

  return schema
}

function defaultStructureForm({
  rolePrefix,
  includeDirectorate = false,
  includeOfficeType = false,
  includeAddress = false,
  includeContacts = false,
}) {
  return {
    nameEn: '',
    nameSw: '',
    code: '',
    slug: '',
    coverImage: null,
    ...(includeDirectorate ? { directorate: '' } : {}),
    ...(includeOfficeType ? { type: 'office' } : {}),
    descriptionEn: '',
    descriptionSw: '',
    functionalities: [],
    ctaEn: '',
    ctaSw: '',
    sloganEn: '',
    sloganSw: '',
    [`${rolePrefix}Prefix`]: '',
    [`${rolePrefix}FirstName`]: '',
    [`${rolePrefix}MiddleName`]: '',
    [`${rolePrefix}Surname`]: '',
    [`${rolePrefix}Email`]: '',
    [`${rolePrefix}PhoneNumber`]: '',
    [`${rolePrefix}ProfilePicture`]: null,
    [`${rolePrefix}JobEn`]: '',
    [`${rolePrefix}JobSw`]: '',
    [`${rolePrefix}StatementEn`]: '',
    [`${rolePrefix}StatementSw`]: '',
    ...(includeAddress
      ? {
          region: '',
          district: '',
          ward: '',
          street: '',
          building: '',
          postalAddress: '',
          physicalAddress: '',
        }
      : {}),
    ...(includeContacts
      ? {
          phoneNumber: '',
          fax: '',
          email: '',
        }
      : {}),
    publicationStatus: 'draft',
  }
}

function mapStructureRecordToForm(
  record = {},
  {
    rolePrefix,
    includeDirectorate = false,
    includeOfficeType = false,
    includeAddress = false,
    includeContacts = false,
  },
) {
  const name = toLocalizedParts(record?.name)
  const description = toLocalizedParts(record?.description || record?.objective)
  const cta = toLocalizedParts(record?.cta)
  const slogan = toLocalizedParts(record?.slogan)
  const person = record?.director || record?.manager || {}

  return {
    nameEn: name.en,
    nameSw: name.sw,
    code: record?.code || '',
    slug: record?.slug || '',
    coverImage: extractMediaFieldValue(record?.coverImage || record?.image),
    ...(includeDirectorate
      ? {
          directorate:
            record?.directorate?._id ||
            record?.directorate?.directorateId ||
            record?.directorate ||
            '',
        }
      : {}),
    ...(includeOfficeType ? { type: record?.type || 'office' } : {}),
    descriptionEn: description.en,
    descriptionSw: description.sw,
    functionalities: toLocalizedCollectionForm(record?.functionalities || record?.functions || []),
    ctaEn: cta.en,
    ctaSw: cta.sw,
    sloganEn: slogan.en,
    sloganSw: slogan.sw,
    ...extractPersonForm(person, rolePrefix),
    [`${rolePrefix}StatementEn`]: toLocalizedParts(
      record?.directorStatement || record?.managerStatement,
    ).en,
    [`${rolePrefix}StatementSw`]: toLocalizedParts(
      record?.directorStatement || record?.managerStatement,
    ).sw,
    ...(includeAddress ? extractAddressForm(record) : {}),
    ...(includeContacts ? extractContactsForm(record) : {}),
    publicationStatus: record?.publicationStatus || 'draft',
  }
}

function mapStructureFormToPayload(
  form,
  {
    rolePrefix,
    includeDirectorate = false,
    includeOfficeType = false,
    includeAddress = false,
    includeContacts = false,
  },
) {
  const person = buildPersonPayload(form, rolePrefix)

  return {
    name: buildLocalizedValue(form.nameEn, form.nameSw),
    code: form.code || '',
    slug: form.slug || '',
    coverImage: buildMediaValue(form.coverImage),
    ...(includeDirectorate ? { directorate: form.directorate } : {}),
    ...(includeOfficeType ? { type: form.type || 'office' } : {}),
    description: buildLocalizedValue(form.descriptionEn, form.descriptionSw),
    objective: buildLocalizedValue(form.descriptionEn, form.descriptionSw),
    functionalities: buildLocalizedCollection(form.functionalities),
    functions: buildLocalizedCollection(form.functionalities),
    cta: buildLocalizedValue(form.ctaEn, form.ctaSw),
    slogan: buildLocalizedValue(form.sloganEn, form.sloganSw),
    ...(rolePrefix === 'director'
      ? {
          director: person,
          directorStatement: buildLocalizedValue(
            form[`${rolePrefix}StatementEn`],
            form[`${rolePrefix}StatementSw`],
          ),
          job: buildLocalizedValue(form[`${rolePrefix}JobEn`], form[`${rolePrefix}JobSw`]),
        }
      : {
          manager: person,
          managerStatement: buildLocalizedValue(
            form[`${rolePrefix}StatementEn`],
            form[`${rolePrefix}StatementSw`],
          ),
          job: buildLocalizedValue(form[`${rolePrefix}JobEn`], form[`${rolePrefix}JobSw`]),
        }),
    ...(includeAddress ? { address: buildAddressPayload(form) } : {}),
    ...(includeContacts ? { contacts: buildContactsPayload(form) } : {}),
    ...(includeContacts
      ? {
          phoneNumber: form.phoneNumber || null,
          fax: form.fax || null,
          email: form.email || null,
          region: form.region || null,
          district: form.district || null,
          ward: form.ward || null,
          street: form.street || null,
          building: form.building || null,
          postalAddress: form.postalAddress || null,
          physicalAddress: form.physicalAddress || null,
        }
      : {}),
    publicationStatus: form.publicationStatus || 'draft',
  }
}

const STATUS_OPTIONS = Object.freeze([
  { label: 'Draft', value: 'draft' },
  { label: 'Under Review', value: 'submitted' },
  { label: 'Approved', value: 'approved' },
  { label: 'Published', value: 'published' },
  { label: 'Unpublished', value: 'unpublished' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Rejected', value: 'rejected' },
])

const INQUIRY_CATEGORY_OPTIONS = Object.freeze([
  { label: 'Inquiry', value: 'inquiry' },
  { label: 'Consumer Complaint', value: 'consumer complaint' },
  { label: 'Competition Complaint', value: 'competition complaint' },
  { label: 'Counterfeit Complaint', value: 'counterfeit complaint' },
  { label: 'Other', value: 'other' },
])

const INQUIRY_LEVEL_OPTIONS = Object.freeze([
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
])

const INQUIRY_STATUS_OPTIONS = Object.freeze([
  { label: 'Pending', value: 'pending' },
  { label: 'Responded', value: 'responded' },
  { label: 'Archived', value: 'archived' },
])

const CATEGORY_VALIDITY_OPTIONS = Object.freeze([
  { label: 'Permanent', value: 'permanent' },
  { label: 'Time-Bound', value: 'time-bound' },
])

const OFFICE_TYPE_OPTIONS = Object.freeze([
  { label: 'Headquarter', value: 'headquarter' },
  { label: 'Office', value: 'office' },
  { label: 'Zonal', value: 'zonal' },
])

const EVENT_TYPE_OPTIONS = Object.freeze([
  { label: 'General Event', value: 'general' },
  { label: 'Conference', value: 'conference' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Seminar', value: 'seminar' },
  { label: 'Outreach', value: 'outreach' },
  { label: 'Launch', value: 'launch' },
  { label: 'Ceremony', value: 'ceremony' },
  { label: 'Meeting', value: 'meeting' },
])

const GENDER_OPTIONS = Object.freeze([
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
])

const MODULE_LABEL_OVERRIDES = Object.freeze({
  publicationCategories: 'Publication Categories',
  socials: 'Social Accounts',
})

const MODULE_SINGULAR_OVERRIDES = Object.freeze({
  publicationCategories: 'Publication Category',
  socials: 'Social Account',
})

const STATE_DESCRIPTIONS = Object.freeze({
  list: (config) => `Manage ${config.label.toLowerCase()} in a reusable enterprise data grid.`,
  create: (config) =>
    `Create ${config.singular.toLowerCase()} records with shared schema-driven forms.`,
  details: (config) =>
    `Review ${config.singular.toLowerCase()} metadata and workflow details in a standard panel.`,
  edit: (config) =>
    `Update ${config.singular.toLowerCase()} fields with reusable schema-driven forms.`,
  reviewQueue: (config) =>
    `Process pending ${config.label.toLowerCase()} submissions in the shared workflow queue.`,
  archive: (config) => `Browse and restore archived ${config.label.toLowerCase()} entries.`,
  history: (config) =>
    `Audit lifecycle history and action timelines for this ${config.singular.toLowerCase()}.`,
  schedule: (config) =>
    `Manage publishing schedules and timing controls for this ${config.singular.toLowerCase()}.`,
  permissions: () => 'Manage access permissions with reusable role-aware controls.',
  assignments: (config) =>
    `Manage assignment mappings and ownership for ${config.label.toLowerCase()}.`,
  ownership: (config) =>
    `Manage ownership assignments and responsible teams for ${config.label.toLowerCase()}.`,
  management: (config) =>
    `Coordinate management workflows for ${config.label.toLowerCase()} using shared controls.`,
  structure: (config) =>
    `Review and maintain organizational structure for ${config.label.toLowerCase()}.`,
  membership: (config) =>
    `Manage member assignments and committee composition for ${config.label.toLowerCase()}.`,
  activity: (config) =>
    `Review recent activity, actions, and audit traces for this ${config.singular.toLowerCase()}.`,
  roles: (config) =>
    `Manage role assignments and role metadata for this ${config.singular.toLowerCase()}.`,
  response: (config) =>
    `Capture and track response actions for this ${config.singular.toLowerCase()}.`,
  analytics: () => 'Review performance and trend insights using shared analytics widgets.',
  summary: () => 'Review consolidated summaries across CMS modules and operational metrics.',
  upload: (config) => `Upload new ${config.singular.toLowerCase()} assets using shared workflows.`,
  usage: (config) =>
    `Track where this ${config.singular.toLowerCase()} is referenced and currently in use.`,
  library: (config) => `Browse the ${config.label.toLowerCase()} library with reusable filters.`,
  rules: (config) => `Manage publishing and governance rules for ${config.label.toLowerCase()}.`,
  segments: (config) =>
    `Manage ${config.label.toLowerCase()} audience segments and subscription groupings.`,
  activityLog: () => 'Track user activities and operational events in a centralized audit view.',
  auditTrail: () => 'Review immutable action trails for compliance and governance reporting.',
  workflowMonitor: () => 'Monitor workflow transitions and queued actions across modules.',
  scheduledJobs: () => 'Monitor scheduled jobs and execution health across the platform.',
  settings: () => 'Manage platform settings and operational configuration safely.',
  overview: () => 'Review high-level platform status and role-aware quick access shortcuts.',
  heatmap: () => 'Inspect visitor traffic distribution and hotspot patterns.',
})

const STATE_TITLE_OVERRIDES = Object.freeze({
  list: (config) => config.label,
  create: (config) => `Create ${config.singular}`,
  details: (config) => `${config.singular} Details`,
  edit: (config) => `Edit ${config.singular}`,
  reviewQueue: (config) => `${config.singular} Review Queue`,
  archive: (config) => `${config.singular} Archive`,
  history: (config) => `${config.singular} History`,
  schedule: (config) => `${config.singular} Schedule`,
  permissions: (config) => `${config.singular} Permissions`,
  assignments: (config) => `${config.singular} Assignments`,
  ownership: (config) => `${config.singular} Ownership`,
  management: (config) => `${config.singular} Management`,
  structure: (config) => `${config.singular} Structure`,
  membership: (config) => `${config.singular} Membership`,
  activity: (config) => `${config.singular} Activity`,
  roles: (config) => `${config.singular} Roles`,
  response: (config) => `${config.singular} Response`,
  upload: (config) => `${config.singular} Upload`,
  usage: (config) => `${config.singular} Usage`,
  library: (config) => `${config.singular} Library`,
  rules: (config) => `${config.singular} Rules`,
  segments: (config) => `${config.singular} Segments`,
  activityLog: () => 'System Activity Log',
  auditTrail: () => 'System Audit Trail',
  workflowMonitor: () => 'System Workflow Monitor',
  scheduledJobs: () => 'System Scheduled Jobs',
  settings: () => 'System Settings',
  overview: () => 'Dashboard Overview',
  heatmap: () => 'Visitor Heatmap',
})

function startCase(value = '') {
  return String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_.]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`)
    .join(' ')
}

function singularize(label = '') {
  const words = String(label || '').split(' ')
  const last = words[words.length - 1] || ''
  let singular = last

  if (/ies$/i.test(last)) singular = `${last.slice(0, -3)}y`
  else if (/ses$/i.test(last)) singular = last.slice(0, -2)
  else if (/s$/i.test(last) && !/ss$/i.test(last)) singular = last.slice(0, -1)

  words[words.length - 1] = singular
  return words.join(' ')
}

function mapCollection(response, keys = []) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key]
  }

  return response?.items || []
}

function mapEntityByKey(response, key) {
  return response?.[key] || response?.item || response || null
}

function buildFallbackConfig(moduleKey = '') {
  const key = String(moduleKey || 'resource')
  const label = MODULE_LABEL_OVERRIDES[key] || startCase(key)
  const singular = MODULE_SINGULAR_OVERRIDES[key] || singularize(label)

  return {
    key,
    label,
    singular,
    routeParam: `${singular.toLowerCase().replace(/\s+/g, '')}Id`,
    idKey: `${singular.toLowerCase().replace(/\s+/g, '')}Id`,
    routes: {
      list: `${key}.list`,
      create: `${key}.create`,
      details: `${key}.details`,
      edit: `${key}.edit`,
    },
  }
}

function buildTitle(config, stateKey) {
  const factory = STATE_TITLE_OVERRIDES[stateKey]
  if (typeof factory === 'function') return factory(config)
  return `${config.singular} ${startCase(stateKey)}`
}

function buildDescription(config, stateKey) {
  const factory = STATE_DESCRIPTIONS[stateKey]
  if (typeof factory === 'function') return factory(config)
  return `This ${config.label.toLowerCase()} workspace is scaffolded with reusable enterprise components and ready for API parity wiring.`
}

export const RESOURCE_CONFIGS = Object.freeze({
  users: {
    key: 'users',
    label: 'Users',
    singular: 'User',
    routeParam: 'userId',
    idKey: 'userId',
    routes: {
      list: 'users.list',
      create: 'users.create',
      details: 'users.details',
      edit: 'users.edit',
    },
    searchPlaceholder: 'Search user by email, first name, surname',
    columns: [
      { key: 'userId', label: 'User ID', minWidth: 170 },
      { key: 'fullName', label: 'Name', minWidth: 180 },
      { key: 'email', label: 'Email', minWidth: 220 },
      {
        key: 'roles',
        label: 'Roles',
        minWidth: 160,
        formatter: (row) => joinNames(row.roles),
      },
      {
        key: 'isActive',
        label: 'Active',
        width: 96,
        formatter: (row) => (row.isActive ? 'Yes' : 'No'),
      },
    ],
    detailFields: [
      { key: 'userId', label: 'User ID' },
      { key: 'fullName', label: 'Full Name' },
      { key: 'email', label: 'Email' },
      { key: 'designation', label: 'Designation' },
      { key: 'phoneNumber', label: 'Phone Number' },
      {
        key: 'roles',
        label: 'Roles',
        formatter: (row) => joinNames(row.roles),
      },
      {
        key: 'isActive',
        label: 'Active',
        formatter: (row) => (row.isActive ? 'Yes' : 'No'),
      },
    ],
    formSchema: [
      { key: 'firstName', label: 'First Name', required: true, component: 'input' },
      { key: 'middleName', label: 'Middle Name', component: 'input' },
      { key: 'surname', label: 'Surname', required: true, component: 'input' },
      {
        key: 'email',
        label: 'Email',
        required: true,
        component: 'input',
        type: 'email',
      },
      { key: 'designation', label: 'Designation', component: 'input' },
      { key: 'phoneNumber', label: 'Phone Number', component: 'input' },
      {
        key: 'password',
        label: 'Password',
        required: true,
        component: 'input',
        type: 'password',
      },
      { key: 'isActive', label: 'Active', component: 'switch' },
    ],
    defaultForm: () => ({
      firstName: '',
      middleName: '',
      surname: '',
      email: '',
      designation: '',
      phoneNumber: '',
      password: '',
      isActive: true,
    }),
    mapRecordToForm(record = {}) {
      return {
        firstName: record.firstName || '',
        middleName: record.middleName || '',
        surname: record.surname || '',
        email: record.email || '',
        designation: record.designation || '',
        phoneNumber: record.phoneNumber || '',
        password: '',
        isActive: Boolean(record.isActive),
      }
    },
    mapFormToPayload(form, mode) {
      const payload = { ...form }
      if (mode === 'edit' && !payload.password) {
        delete payload.password
      }
      return payload
    },
    adapter: {
      list: (query) => usersAPI.fetchUsers(query),
      find: (id) => usersAPI.fetchUser({ userId: id }),
      create: (payload) => usersAPI.createUser(payload),
      update: (id, payload) => usersAPI.updateUser({ userId: id, ...payload }),
      remove: (id) => usersAPI.deactivateUser({ userId: id }),
      mapItems: (response) => response?.users || response?.items || [],
      mapEntity: (response) => response?.user || response?.profile || response || null,
      getId: (record) => record?.userId || null,
    },
  },

  roles: {
    key: 'roles',
    label: 'Roles',
    singular: 'Role',
    routeParam: 'roleId',
    idKey: 'roleId',
    routes: {
      list: 'roles.list',
      create: 'roles.create',
      details: 'roles.details',
      edit: 'roles.edit',
    },
    searchPlaceholder: 'Search role by name or description',
    columns: [
      { key: 'roleId', label: 'Role ID', minWidth: 170 },
      { key: 'name', label: 'Name', minWidth: 180 },
      { key: 'description', label: 'Description', minWidth: 220 },
      {
        key: 'permissions',
        label: 'Permissions',
        minWidth: 220,
        formatter: (row) =>
          Array.isArray(row.permissions) && row.permissions.length
            ? row.permissions.join(', ')
            : '-',
      },
    ],
    detailFields: [
      { key: 'roleId', label: 'Role ID' },
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      {
        key: 'permissions',
        label: 'Permissions',
        formatter: (row) =>
          Array.isArray(row.permissions) && row.permissions.length
            ? row.permissions.join(', ')
            : '-',
      },
    ],
    formSchema: [
      { key: 'name', label: 'Role Name', required: true, component: 'input' },
      { key: 'description', label: 'Description', component: 'textarea' },
      {
        key: 'permissionsText',
        label: 'Permissions (comma separated)',
        component: 'textarea',
        placeholder: 'create, update, delete, review, publish, archive',
      },
    ],
    defaultForm: () => ({
      name: '',
      description: '',
      permissionsText: '',
    }),
    mapRecordToForm(record = {}) {
      return {
        name: record.name || '',
        description: record.description || '',
        permissionsText: Array.isArray(record.permissions) ? record.permissions.join(', ') : '',
      }
    },
    mapFormToPayload(form) {
      return {
        name: form.name,
        description: form.description,
        permissions: parseCSV(form.permissionsText),
      }
    },
    adapter: {
      list: (query) => rolesAPI.listRoles(query),
      find: (id) => rolesAPI.findRole({ roleId: id }),
      create: (payload) => rolesAPI.createRole(payload),
      update: (id, payload) => rolesAPI.updateRole({ roleId: id, ...payload }),
      remove: (id) => rolesAPI.deleteRole({ roleId: id }),
      mapItems: (response) => response?.roles || response?.items || [],
      mapEntity: (response) => response?.role || response || null,
      getId: (record) => record?.roleId || null,
    },
  },

  partners: {
    key: 'partners',
    label: 'Partners',
    singular: 'Partner',
    routeParam: 'partnerId',
    idKey: 'partnerId',
    routes: {
      list: 'partners.list',
      create: 'partners.create',
      details: 'partners.details',
      edit: 'partners.edit',
    },
    searchPlaceholder: 'Search partner by name, category, website',
    columns: [
      { key: 'partnerId', label: 'Partner ID', minWidth: 180 },
      { key: 'name', label: 'Name', minWidth: 200 },
      { key: 'category', label: 'Category', minWidth: 160 },
      { key: 'publicationStatus', label: 'Status', minWidth: 120 },
      {
        key: 'website',
        label: 'Website',
        minWidth: 220,
        formatter: (row) => row?.website || '-',
      },
    ],
    detailFields: [
      { key: 'partnerId', label: 'Partner ID' },
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'publicationStatus', label: 'Status' },
      { key: 'website', label: 'Website' },
      { key: 'logo', label: 'Logo' },
      { key: 'description', label: 'Description' },
    ],
    formSchema: [
      { key: 'name', label: 'Name', required: true, component: 'input' },
      { key: 'category', label: 'Category', component: 'input' },
      { key: 'website', label: 'Website', component: 'input', type: 'url' },
      { key: 'logo', label: 'Logo', component: 'input' },
      { key: 'description', label: 'Description', component: 'textarea' },
      {
        key: 'publicationStatus',
        label: 'Status',
        component: 'select',
        options: STATUS_OPTIONS,
      },
    ],
    defaultForm: () => ({
      name: '',
      category: '',
      website: '',
      logo: '',
      description: '',
      publicationStatus: 'draft',
    }),
    mapRecordToForm(record = {}) {
      return {
        name: record.name || '',
        category: record.category || '',
        website: record.website || '',
        logo: record.logo || '',
        description: record.description || '',
        publicationStatus: record.publicationStatus || 'draft',
      }
    },
    mapFormToPayload(form) {
      return {
        name: form.name,
        category: form.category || '',
        website: form.website || '',
        logo: form.logo || '',
        description: form.description || '',
        publicationStatus: form.publicationStatus || 'draft',
      }
    },
    adapter: {
      list: (query) => partnersAPI.listPartners(query),
      listPublished: (query) => partnersAPI.listPublishedPartners(query),
      find: (id) => partnersAPI.findPartner({ partnerId: id }),
      create: (payload) => partnersAPI.createPartner({ partnerInfo: payload }),
      update: (id, payload) => partnersAPI.updatePartner({ partnerId: id, ...payload }),
      remove: (id) => partnersAPI.deletePartner({ partnerId: id }),
      listArchived: (query) => partnersAPI.listArchivedPartners(query),
      submit: (id) => partnersAPI.submitPartnerForApproval({ partnerId: id }),
      approve: (id) => partnersAPI.approvePartner({ partnerId: id }),
      reject: (id, { reason } = {}) => partnersAPI.rejectPartner({ partnerId: id, reason }),
      publish: (id) => partnersAPI.publishPartner({ partnerId: id }),
      unpublish: (id) => partnersAPI.unpublishPartner({ partnerId: id }),
      archive: (id, { reason } = {}) => partnersAPI.archivePartner({ partnerId: id, reason }),
      restore: (id) => partnersAPI.restorePartner({ partnerId: id }),
      restoreArchived: (id) => partnersAPI.restoreArchivedPartner({ partnerId: id }),
      softDelete: (id, { reason } = {}) => partnersAPI.softDeletePartner({ partnerId: id, reason }),
      mapItems: (response) => response?.partners || response?.items || [],
      mapEntity: (response) => response?.partner || response || null,
      getId: (record) => record?.partnerId || null,
    },
  },

  assets: {
    key: 'assets',
    label: 'Assets',
    singular: 'Asset',
    routeParam: 'assetId',
    idKey: 'imageId',
    routes: {
      list: 'assets.library',
      create: 'assets.upload',
      details: 'assets.details',
    },
    searchPlaceholder: 'Search assets by caption, tag, placement, or usage area',
    columns: [
      { key: 'imageId', label: 'Asset ID', minWidth: 170 },
      { key: 'caption', label: 'Caption', minWidth: 260 },
      { key: 'usageArea', label: 'Usage Area', minWidth: 160 },
      { key: 'sortOrder', label: 'Order', minWidth: 100 },
      { key: 'status', label: 'Status', minWidth: 120 },
      {
        key: 'published',
        label: 'Published',
        minWidth: 110,
        formatter: (row) => (row?.published ? 'Yes' : 'No'),
      },
      {
        key: 'archived',
        label: 'Archived',
        minWidth: 110,
        formatter: (row) => (row?.archived ? 'Yes' : 'No'),
      },
    ],
    detailFields: [
      { key: 'imageId', label: 'Asset ID' },
      { key: 'caption', label: 'Caption' },
      { key: 'altText', label: 'Alternative Text' },
      { key: 'usageArea', label: 'Usage Area' },
      { key: 'placement', label: 'Placement' },
      { key: 'sortOrder', label: 'Display Order' },
      {
        key: 'tags',
        label: 'Tags',
        formatter: (row) =>
          Array.isArray(row?.tags) && row.tags.length ? row.tags.join(', ') : '-',
      },
      { key: 'credit', label: 'Credit' },
      { key: 'aspectRatioHint', label: 'Aspect Ratio' },
      { key: 'status', label: 'Status' },
      {
        key: 'url',
        label: 'URL',
        formatter: (row) => row?.url || row?.imageURL || '-',
      },
      {
        key: 'published',
        label: 'Published',
        formatter: (row) => (row?.published ? 'Yes' : 'No'),
      },
      {
        key: 'archived',
        label: 'Archived',
        formatter: (row) => (row?.archived ? 'Yes' : 'No'),
      },
      {
        key: 'lastModified',
        label: 'Last Modified',
        formatter: (row) => toISODateTime(row?.lastModified) || '-',
      },
    ],
    formSchema: [
      { key: 'caption', label: 'Caption', required: true, component: 'textarea' },
      {
        key: 'status',
        label: 'Status',
        component: 'select',
        options: STATUS_OPTIONS,
      },
    ],
    defaultForm: () => ({
      caption: '',
      status: 'draft',
    }),
    mapRecordToForm(record = {}) {
      return {
        caption: record?.caption || '',
        status: record?.status || 'draft',
      }
    },
    mapFormToPayload(form) {
      return {
        caption: form.caption,
        status: form.status || 'draft',
      }
    },
    adapter: {
      list: (query) => assetsAPI.listAssets(query),
      listPublished: (query) => assetsAPI.listPublishedAssets(query),
      find: (id) => assetsAPI.findAsset({ assetId: id }),
      create: (payload) => assetsAPI.createAsset({ assetInfo: payload }),
      update: (id, payload) => assetsAPI.updateAsset({ assetId: id, assetInfo: payload }),
      remove: (id) => assetsAPI.deleteAsset({ assetId: id }),
      publish: (id) => assetsAPI.publishAsset({ assetId: id }),
      unpublish: (id) => assetsAPI.unpublishAsset({ assetId: id }),
      archive: (id, { reason } = {}) => assetsAPI.archiveAsset({ assetId: id, reason }),
      restoreArchived: (id) => assetsAPI.unarchiveAsset({ assetId: id }),
      mapItems: (response) => mapCollection(response, ['images']),
      mapEntity: (response) => mapEntityByKey(response, 'image'),
      getId: (record) => record?.imageId || record?._id || null,
    },
    resolveWorkflowState(record = {}) {
      return (
        record?.publicationStatus || record?.status || (record?.published ? 'published' : 'draft')
      )
    },
  },

  photos: {
    key: 'photos',
    label: 'Photos',
    singular: 'Photo',
    routeParam: 'photoId',
    idKey: 'imageId',
    routes: {
      list: 'photos.list',
      create: 'photos.upload',
      details: 'photos.details',
      edit: 'photos.edit',
    },
    searchPlaceholder: 'Search photos by caption, tag, placement, or usage area',
    columns: [
      { key: 'imageId', label: 'Photo ID', minWidth: 170 },
      { key: 'caption', label: 'Caption', minWidth: 260 },
      { key: 'usageArea', label: 'Usage Area', minWidth: 160 },
      { key: 'sortOrder', label: 'Order', minWidth: 100 },
      { key: 'status', label: 'Status', minWidth: 120 },
      {
        key: 'published',
        label: 'Published',
        minWidth: 110,
        formatter: (row) => (row?.published ? 'Yes' : 'No'),
      },
      {
        key: 'archived',
        label: 'Archived',
        minWidth: 110,
        formatter: (row) => (row?.archived ? 'Yes' : 'No'),
      },
    ],
    detailFields: [
      { key: 'imageId', label: 'Photo ID' },
      {
        key: 'url',
        label: 'Preview',
        kind: 'image',
        formatter: (row) => row?.url || row?.imageURL || '-',
      },
      { key: 'caption', label: 'Caption' },
      { key: 'altText', label: 'Alternative Text' },
      { key: 'usageArea', label: 'Usage Area' },
      { key: 'placement', label: 'Placement' },
      { key: 'sortOrder', label: 'Display Order' },
      {
        key: 'tags',
        label: 'Tags',
        formatter: (row) =>
          Array.isArray(row?.tags) && row.tags.length ? row.tags.join(', ') : '-',
      },
      { key: 'credit', label: 'Credit' },
      { key: 'aspectRatioHint', label: 'Aspect Ratio' },
      { key: 'status', label: 'Status' },
      {
        key: 'url',
        label: 'URL',
        formatter: (row) => row?.url || row?.imageURL || '-',
      },
      {
        key: 'published',
        label: 'Published',
        formatter: (row) => (row?.published ? 'Yes' : 'No'),
      },
      {
        key: 'archived',
        label: 'Archived',
        formatter: (row) => (row?.archived ? 'Yes' : 'No'),
      },
      {
        key: 'lastModified',
        label: 'Last Modified',
        formatter: (row) => toISODateTime(row?.lastModified) || '-',
      },
    ],
    formSchema: [
      {
        key: 'image',
        label: 'Replace Image',
        component: 'file-upload',
        accept: '.jpg,.jpeg,.png,image/jpeg,image/png',
        multiple: false,
        limit: 1,
        uploadTitle: 'Drop a replacement image here or click to choose one',
        uploadHint: 'Leave this empty to keep the current image and only update metadata.',
        tip: 'JPEG and PNG images only.',
      },
      { key: 'caption', label: 'Caption', required: true, component: 'textarea', rows: 4 },
      { key: 'altText', label: 'Alternative Text', component: 'textarea', rows: 4 },
      { key: 'usageArea', label: 'Usage Area', component: 'input' },
      { key: 'placement', label: 'Placement', component: 'input' },
      { key: 'credit', label: 'Credit', component: 'input' },
      { key: 'sortOrder', label: 'Display Order', component: 'input', type: 'number' },
      {
        key: 'tags',
        label: 'Tags',
        component: 'tag-input',
        placeholder: 'Add image tags and press Enter',
      },
      {
        key: 'status',
        label: 'Status',
        component: 'select',
        options: STATUS_OPTIONS,
      },
    ],
    defaultForm: () => ({
      image: null,
      caption: '',
      altText: '',
      usageArea: '',
      placement: '',
      credit: '',
      sortOrder: 0,
      tags: [],
      status: 'draft',
    }),
    mapRecordToForm(record = {}) {
      return {
        image: null,
        caption: record?.caption || '',
        altText: record?.altText || '',
        usageArea: record?.usageArea || '',
        placement: record?.placement || '',
        credit: record?.credit || '',
        sortOrder: Number(record?.sortOrder || 0),
        tags: Array.isArray(record?.tags) ? record.tags : [],
        status: record?.status || 'draft',
      }
    },
    mapFormToPayload(form) {
      return {
        ...(form.image ? { image: form.image } : {}),
        caption: form.caption,
        altText: form.altText || '',
        usageArea: form.usageArea || '',
        placement: form.placement || '',
        credit: form.credit || '',
        sortOrder: Number(form.sortOrder || 0),
        tags: normalizeTagList(form.tags),
        status: form.status || 'draft',
      }
    },
    adapter: {
      list: (query) => photosAPI.listPhotos(query),
      listPublished: (query) => photosAPI.listPublishedPhotos(query),
      find: (id) => photosAPI.findPhoto({ photoId: id }),
      create: (payload) => photosAPI.createPhoto({ photoInfo: payload }),
      update: (id, payload) => photosAPI.updatePhoto({ photoId: id, photoInfo: payload }),
      remove: (id) => photosAPI.deletePhoto({ photoId: id }),
      publish: (id) => photosAPI.publishPhoto({ photoId: id }),
      unpublish: (id) => photosAPI.unpublishPhoto({ photoId: id }),
      archive: (id, { reason } = {}) => photosAPI.archivePhoto({ photoId: id, reason }),
      restoreArchived: (id) => photosAPI.unarchivePhoto({ photoId: id }),
      mapItems: (response) => mapCollection(response, ['images']),
      mapEntity: (response) => mapEntityByKey(response, 'image'),
      getId: (record) => record?.imageId || record?._id || null,
    },
    resolveWorkflowState(record = {}) {
      return (
        record?.publicationStatus || record?.status || (record?.published ? 'published' : 'draft')
      )
    },
  },

  subscribers: {
    key: 'subscribers',
    label: 'Subscribers',
    singular: 'Subscriber',
    routeParam: 'subscriberId',
    idKey: 'subscriberId',
    routes: {
      list: 'subscribers.list',
      details: 'subscribers.details',
    },
    searchPlaceholder: 'Search subscribers by email or full name',
    columns: [
      { key: 'subscriberId', label: 'Subscriber ID', minWidth: 190 },
      { key: 'fullName', label: 'Full Name', minWidth: 210 },
      { key: 'email', label: 'Email', minWidth: 240 },
      { key: 'status', label: 'Status', minWidth: 120 },
      {
        key: 'lastModified',
        label: 'Last Modified',
        minWidth: 170,
        formatter: (row) => toISODateTime(row?.lastModified) || '-',
      },
    ],
    detailFields: [
      { key: 'subscriberId', label: 'Subscriber ID' },
      { key: 'fullName', label: 'Full Name' },
      { key: 'firstName', label: 'First Name' },
      { key: 'surname', label: 'Surname' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Status' },
      {
        key: 'createdAt',
        label: 'Created At',
        formatter: (row) => toISODateTime(row?.createdAt) || '-',
      },
      {
        key: 'lastModified',
        label: 'Last Modified',
        formatter: (row) => toISODateTime(row?.lastModified) || '-',
      },
    ],
    formSchema: [
      { key: 'fullName', label: 'Full Name', required: true, component: 'input' },
      { key: 'email', label: 'Email', required: true, component: 'input', type: 'email' },
      {
        key: 'status',
        label: 'Status',
        component: 'select',
        options: STATUS_OPTIONS,
      },
    ],
    defaultForm: () => ({
      fullName: '',
      email: '',
      status: 'active',
    }),
    mapRecordToForm(record = {}) {
      return {
        fullName: record?.fullName || '',
        email: record?.email || '',
        status: record?.status || 'active',
      }
    },
    mapFormToPayload(form) {
      return {
        fullName: form.fullName,
        email: form.email,
        status: form.status || 'active',
      }
    },
    adapter: {
      list: (query) => subscribersAPI.listSubscribers(query),
      find: (id) => subscribersAPI.findSubscriber({ subscriberId: id }),
      mapItems: (response) => mapCollection(response, ['subscribers']),
      mapEntity: (response) => mapEntityByKey(response, 'subscriber'),
      getId: (record) => record?.subscriberId || record?._id || null,
    },
    resolveWorkflowState(record = {}) {
      return record?.publicationStatus || record?.status || 'active'
    },
  },

  commission: {
    key: 'commission',
    label: 'Commission',
    singular: 'Commission',
    routeParam: 'commissionId',
    idKey: 'commissionId',
    singleton: true,
    routes: {
      list: 'commission.details',
      details: 'commission.details',
      edit: 'commission.edit',
    },
    detailFields: [
      { key: 'commissionId', label: 'Commission ID' },
      { key: 'name', label: 'Name', formatter: (row) => toLocalizedPreview(row?.name) },
      {
        key: 'introduction',
        label: 'Introduction',
        formatter: (row) => toLocalizedPreview(row?.introduction),
      },
      { key: 'mandate', label: 'Mandate', formatter: (row) => toLocalizedPreview(row?.mandate) },
      { key: 'history', label: 'History', formatter: (row) => toLocalizedPreview(row?.history) },
      { key: 'slogan', label: 'Slogan', formatter: (row) => toLocalizedPreview(row?.slogan) },
      { key: 'cta', label: 'Call To Action', formatter: (row) => toLocalizedPreview(row?.cta) },
    ],
    formSchema: [
      { key: 'introduction', label: 'Introduction', component: 'textarea' },
      { key: 'mandate', label: 'Mandate', component: 'textarea' },
      { key: 'slogan', label: 'Slogan', component: 'input' },
      { key: 'cta', label: 'CTA', component: 'textarea' },
    ],
    defaultForm: () => ({
      introduction: '',
      mandate: '',
      slogan: '',
      cta: '',
    }),
    mapRecordToForm(record = {}) {
      return {
        introduction: record?.introduction || '',
        mandate: record?.mandate || '',
        slogan: record?.slogan || '',
        cta: record?.cta || '',
      }
    },
    mapFormToPayload(form) {
      return {
        introduction: form.introduction || '',
        mandate: form.mandate || '',
        slogan: form.slogan || '',
        cta: form.cta || '',
      }
    },
    adapter: {
      list: () => commissionAPI.fetchCommission(),
      find: () => commissionAPI.fetchCommission(),
      update: (_id, payload) => commissionAPI.updateCommission(payload),
      ...buildGenericWorkflowAdapter(commissionAPI),
      mapItems: (response) => [response?.commission].filter(Boolean),
      mapEntity: (response) => response?.commission || response || null,
      getId: (record) => record?.commissionId || 'commission',
    },
  },

  dashboard: {
    key: 'dashboard',
    label: 'Dashboard',
    singular: 'Dashboard',
    routeParam: 'dashboardId',
    idKey: 'dashboardId',
    singleton: true,
    routes: {
      list: 'dashboard.overview',
      details: 'dashboard.summary',
    },
    detailFields: [
      { key: 'totalVisitors', label: 'Total Visitors' },
      { key: 'todayVisitors', label: 'Today Visitors' },
      { key: 'onlineVisitors', label: 'Online Visitors' },
      { key: 'recentPublicationsCount', label: 'Recent Publications' },
    ],
    adapter: {
      find: () => dashboardAPI.fetchDashboardSummary(),
      mapEntity: (response) => response?.summary || response || null,
      getId: () => 'dashboard',
    },
  },

  system: {
    key: 'system',
    label: 'System',
    singular: 'System',
    routeParam: 'systemId',
    idKey: 'systemId',
    singleton: true,
    routes: {
      list: 'system.activityLog',
    },
  },

  visitors: {
    key: 'visitors',
    label: 'Visitors',
    singular: 'Visitor',
    routeParam: 'visitorId',
    idKey: 'visitorId',
    routes: {
      list: 'visitors.list',
    },
    searchPlaceholder: 'Search visitor by token, IP, or visitor ID',
    columns: [
      { key: 'visitorId', label: 'Visitor ID', minWidth: 190 },
      { key: 'ipAddress', label: 'IP Address', minWidth: 170 },
      { key: 'visitCount', label: 'Visits', minWidth: 100 },
      {
        key: 'isActive',
        label: 'Active',
        minWidth: 100,
        formatter: (row) => (row?.isActive ? 'Yes' : 'No'),
      },
    ],
    detailFields: [
      { key: 'visitorId', label: 'Visitor ID' },
      { key: 'visitorToken', label: 'Token' },
      { key: 'ipAddress', label: 'IP Address' },
      { key: 'userAgent', label: 'User Agent' },
      { key: 'visitCount', label: 'Visit Count' },
      {
        key: 'lastVisit',
        label: 'Last Visit',
        formatter: (row) => toISODateTime(row?.lastVisit) || '-',
      },
    ],
    adapter: {
      list: (query) => visitorsAPI.listVisitors(query),
      find: (id) => visitorsAPI.findVisitor(id),
      mapItems: (response) => mapCollection(response, ['visitors']),
      mapEntity: (response) => mapEntityByKey(response, 'visitor'),
      getId: (record) => record?.visitorId || null,
    },
  },

  inquiries: {
    key: 'inquiries',
    label: 'Inquiries',
    singular: 'Inquiry',
    routeParam: 'inquiryId',
    idKey: 'inquiryId',
    routes: {
      list: 'inquiries.list',
      details: 'inquiries.details',
      response: 'inquiries.response',
    },
    searchPlaceholder: 'Search inquiry by sender, email, message',
    columns: [
      { key: 'inquiryId', label: 'Inquiry ID', minWidth: 180 },
      {
        key: 'sender',
        label: 'Sender',
        minWidth: 180,
        formatter: (row) => row?.sender?.fullName || '-',
      },
      {
        key: 'sender',
        label: 'Email',
        minWidth: 220,
        formatter: (row) => row?.sender?.email || '-',
      },
      { key: 'category', label: 'Category', minWidth: 160 },
      { key: 'status', label: 'Status', minWidth: 120 },
      { key: 'priority', label: 'Priority', minWidth: 110 },
      {
        key: 'createdAt',
        label: 'Created',
        minWidth: 150,
        formatter: (row) => toISODateTime(row?.createdAt) || '-',
      },
    ],
    detailFields: [
      { key: 'inquiryId', label: 'Inquiry ID' },
      {
        key: 'sender',
        label: 'Sender',
        formatter: (row) => row?.sender?.fullName || '-',
      },
      {
        key: 'sender',
        label: 'Email',
        formatter: (row) => row?.sender?.email || '-',
      },
      {
        key: 'sender',
        label: 'Phone',
        formatter: (row) => row?.sender?.phoneNumber || '-',
      },
      { key: 'category', label: 'Category' },
      { key: 'severity', label: 'Severity' },
      { key: 'priority', label: 'Priority' },
      { key: 'status', label: 'Status' },
      { key: 'message', label: 'Message' },
      { key: 'response', label: 'Response' },
      {
        key: 'respondedAt',
        label: 'Responded At',
        formatter: (row) => toISODateTime(row?.respondedAt) || '-',
      },
      {
        key: 'tags',
        label: 'Tags',
        formatter: (row) =>
          Array.isArray(row?.tags) && row.tags.length ? row.tags.join(', ') : '-',
      },
    ],
    formSchema: [
      { key: 'senderName', label: 'Sender Name', required: true, component: 'input' },
      { key: 'senderEmail', label: 'Sender Email', component: 'input', type: 'email' },
      { key: 'senderPhoneNumber', label: 'Sender Phone', component: 'input' },
      { key: 'message', label: 'Message', required: true, component: 'textarea' },
      {
        key: 'category',
        label: 'Category',
        component: 'select',
        options: INQUIRY_CATEGORY_OPTIONS,
      },
      {
        key: 'severity',
        label: 'Severity',
        component: 'select',
        options: INQUIRY_LEVEL_OPTIONS,
      },
      {
        key: 'priority',
        label: 'Priority',
        component: 'select',
        options: INQUIRY_LEVEL_OPTIONS,
      },
      {
        key: 'status',
        label: 'Status',
        component: 'select',
        options: INQUIRY_STATUS_OPTIONS,
      },
      { key: 'tagsText', label: 'Tags (comma separated)', component: 'textarea' },
      { key: 'response', label: 'Response', component: 'textarea' },
    ],
    defaultForm: () => ({
      senderName: '',
      senderEmail: '',
      senderPhoneNumber: '',
      message: '',
      category: 'inquiry',
      severity: 'low',
      priority: 'low',
      status: 'pending',
      tagsText: '',
      response: '',
    }),
    mapRecordToForm(record = {}) {
      return {
        senderName: record?.sender?.fullName || '',
        senderEmail: record?.sender?.email || '',
        senderPhoneNumber: record?.sender?.phoneNumber || '',
        message: record?.message || '',
        category: record?.category || 'inquiry',
        severity: record?.severity || 'low',
        priority: record?.priority || 'low',
        status: record?.status || 'pending',
        tagsText: Array.isArray(record?.tags) ? record.tags.join(', ') : '',
        response: record?.response || '',
      }
    },
    mapFormToPayload(form) {
      return {
        sender: {
          fullName: form.senderName,
          email: form.senderEmail || undefined,
          phoneNumber: form.senderPhoneNumber || undefined,
        },
        message: form.message,
        category: form.category || 'inquiry',
        severity: form.severity || 'low',
        priority: form.priority || 'low',
        status: form.status || 'pending',
        tags: parseCSV(form.tagsText),
        response: form.response || undefined,
      }
    },
    adapter: {
      list: (query) => inquiriesAPI.listInquiries(query),
      listPublished: (query) => inquiriesAPI.listPublishedInquiries(query),
      find: (id) => inquiriesAPI.findInquiry({ inquiryId: id }),
      create: (payload) => inquiriesAPI.createInquiry(payload),
      update: (id, payload) => inquiriesAPI.updateInquiry({ inquiryId: id, ...payload }),
      remove: (id) => inquiriesAPI.deleteInquiry({ inquiryId: id }),
      listArchived: (query) => inquiriesAPI.listArchivedInquiries(query),
      submit: (id) => inquiriesAPI.submitInquiryForApproval({ inquiryId: id }),
      approve: (id) => inquiriesAPI.approveInquiry({ inquiryId: id }),
      reject: (id, { reason } = {}) => inquiriesAPI.rejectInquiry({ inquiryId: id, reason }),
      publish: (id) => inquiriesAPI.publishInquiry({ inquiryId: id }),
      unpublish: (id) => inquiriesAPI.unpublishInquiry({ inquiryId: id }),
      schedulePublish: (id, payload = {}) =>
        inquiriesAPI.scheduleInquiryPublish({ inquiryId: id, ...payload }),
      scheduleUnpublish: (id, payload = {}) =>
        inquiriesAPI.scheduleInquiryUnpublish({ inquiryId: id, ...payload }),
      cancelPublishSchedule: (id) => inquiriesAPI.cancelInquiryPublishSchedule({ inquiryId: id }),
      cancelUnpublishSchedule: (id) =>
        inquiriesAPI.cancelInquiryUnpublishSchedule({ inquiryId: id }),
      archive: (id, { reason } = {}) => inquiriesAPI.archiveInquiry({ inquiryId: id, reason }),
      restore: (id) => inquiriesAPI.restoreInquiry({ inquiryId: id }),
      restoreArchived: (id) => inquiriesAPI.restoreArchivedInquiry({ inquiryId: id }),
      softDelete: (id, { reason } = {}) =>
        inquiriesAPI.softDeleteInquiry({ inquiryId: id, reason }),
      bulkPublish: ({ ids } = {}) => inquiriesAPI.publishInquiries({ ids }),
      bulkUnpublish: ({ ids } = {}) => inquiriesAPI.unpublishInquiries({ ids }),
      bulkSchedulePublish: ({ items } = {}) => inquiriesAPI.scheduleInquiriesPublish({ items }),
      bulkScheduleUnpublish: ({ items } = {}) => inquiriesAPI.scheduleInquiriesUnpublish({ items }),
      bulkCancelPublishSchedule: ({ ids } = {}) =>
        inquiriesAPI.cancelInquiriesPublishSchedule({ ids }),
      bulkCancelUnpublishSchedule: ({ ids } = {}) =>
        inquiriesAPI.cancelInquiriesUnpublishSchedule({ ids }),
      bulkArchive: ({ ids, reason } = {}) => inquiriesAPI.archiveInquiries({ ids, reason }),
      bulkRestore: ({ ids } = {}) => inquiriesAPI.restoreInquiries({ ids }),
      bulkRestoreArchived: ({ ids } = {}) => inquiriesAPI.restoreArchivedInquiries({ ids }),
      bulkSoftDelete: ({ ids, reason } = {}) => inquiriesAPI.softDeleteInquiries({ ids, reason }),
      mapItems: (response) => response?.inquiries || response?.items || [],
      mapEntity: (response) => response?.inquiry || response || null,
      getId: (record) => record?.inquiryId || null,
    },
  },

  events: {
    key: 'events',
    label: 'Events',
    singular: 'Event',
    overview: {
      description:
        'Plan, review, and publish event programmes with structured venue, guest, and sponsor data from one editorial workspace.',
    },
    wizard: {
      enabled: true,
    },
    routeParam: 'eventId',
    idKey: 'eventId',
    routes: {
      list: 'events.list',
      create: 'events.create',
      details: 'events.details',
      edit: 'events.edit',
    },
    searchPlaceholder: 'Search event by title or type',
    columns: [
      { key: 'eventId', label: 'Event ID', minWidth: 170 },
      { key: 'title', label: 'Title', minWidth: 220 },
      { key: 'eventType', label: 'Type', minWidth: 120 },
      {
        key: 'occurrences',
        label: 'Venue & Dates',
        minWidth: 260,
        formatter: (row) => formatEventOccurrencesSummary(row),
      },
      { key: 'publicationStatus', label: 'Status', minWidth: 120 },
    ],
    detailFields: [
      { key: 'eventId', label: 'Event ID' },
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description' },
      {
        key: 'coverImage',
        label: 'Cover Image',
        kind: 'image',
        formatter: (row) => row?.coverImage?.url || '-',
      },
      { key: 'eventType', label: 'Type' },
      {
        key: 'occurrences',
        label: 'Venue & Dates',
        formatter: (row) => formatEventOccurrencesSummary(row),
      },
      {
        key: 'targetAudience',
        label: 'Target Audience',
        formatter: (row) =>
          Array.isArray(row?.targetAudience) && row.targetAudience.length
            ? row.targetAudience.join(', ')
            : '-',
      },
      {
        key: 'tags',
        label: 'Tags',
        formatter: (row) =>
          Array.isArray(row?.tags) && row.tags.length ? row.tags.join(', ') : '-',
      },
      {
        key: 'sponsors',
        label: 'Sponsors',
        formatter: (row) => formatEventPeopleSummary(row?.sponsors),
      },
      {
        key: 'guestOfHonors',
        label: 'Guest of Honors',
        formatter: (row) => formatEventPeopleSummary(row?.guestOfHonors),
      },
      {
        key: 'specialGuests',
        label: 'Special Guests',
        formatter: (row) => formatEventPeopleSummary(row?.specialGuests),
      },
      { key: 'publicationStatus', label: 'Status' },
      {
        key: 'isFeatured',
        label: 'Featured',
        formatter: (row) => (row.isFeatured ? 'Yes' : 'No'),
      },
    ],
    formSchema: [
      {
        component: 'section',
        label: 'Event Information',
        description:
          'Define the event identity, editorial summary, and media that will appear across the website and review queues.',
      },
      { key: 'title', label: 'Title', required: true, component: 'input' },
      {
        key: 'description',
        label: 'Description',
        required: true,
        component: 'textarea',
        rows: 6,
        fullWidth: true,
      },
      {
        key: 'eventType',
        label: 'Event Type',
        required: true,
        component: 'select',
        options: EVENT_TYPE_OPTIONS,
      },
      {
        key: 'coverImage',
        label: 'Cover Image',
        component: 'file-upload',
        accept: '.jpg,.jpeg,.png,image/jpeg,image/png',
        multiple: false,
        limit: 1,
        uploadTitle: 'Drop the event cover image here or click to choose it',
        uploadHint:
          'Use a strong landscape image for event cards, listings, and public detail pages.',
        tip: 'JPEG and PNG images only.',
      },
      {
        key: 'targetAudience',
        label: 'Target Audience',
        component: 'tag-input',
        placeholder: 'Add audience tags and press Enter',
      },
      {
        key: 'tags',
        label: 'Tags',
        component: 'tag-input',
        placeholder: 'Add event tags and press Enter',
      },
      {
        key: 'publicationStatus',
        label: 'Status',
        component: 'select',
        options: STATUS_OPTIONS,
      },
      { key: 'isFeatured', label: 'Featured', component: 'switch' },
      {
        component: 'section',
        label: 'Event Venue and Schedule',
        description:
          'Capture the event dates, venue information, and session schedule in the structure reviewers and publishers need.',
      },
      {
        key: 'occurrences',
        label: 'Occurrences',
        required: true,
        component: 'repeatable-list',
        addLabel: 'Add occurrence',
        itemTitle: 'Occurrence',
        itemDescription: 'Each occurrence represents one event date and venue pairing.',
        itemSchema: [
          {
            key: 'startDate',
            label: 'Start Date',
            component: 'input',
            type: 'date',
            required: true,
          },
          {
            key: 'endDate',
            label: 'End Date',
            component: 'input',
            type: 'date',
            required: true,
          },
          {
            key: 'venueName',
            label: 'Venue Name',
            component: 'input',
            required: true,
            placeholder: 'FCC Hall',
          },
          {
            key: 'venueLocation',
            label: 'Venue Location',
            component: 'input',
            placeholder: 'Dodoma, Tanzania',
          },
        ],
        fullWidth: true,
      },
      {
        key: 'schedule',
        label: 'Programme Schedule',
        component: 'repeatable-list',
        addLabel: 'Add schedule item',
        itemTitle: 'Schedule Item',
        itemDescription: 'Outline the main sessions or agenda blocks for this event.',
        itemSchema: [
          {
            key: 'title',
            label: 'Session Title',
            component: 'input',
            required: true,
          },
          {
            key: 'speaker',
            label: 'Speaker',
            component: 'input',
            placeholder: 'Guest speaker or moderator',
          },
          {
            key: 'startTime',
            label: 'Start Time',
            component: 'input',
            type: 'time',
            required: true,
          },
          {
            key: 'endTime',
            label: 'End Time',
            component: 'input',
            type: 'time',
            required: true,
          },
          {
            key: 'description',
            label: 'Description',
            component: 'textarea',
            rows: 3,
          },
        ],
        fullWidth: true,
      },
      {
        component: 'section',
        label: 'Event Sponsors',
        description:
          'Track sponsoring organizations when the event format requires partnership visibility.',
        visibleWhen: (model) => model.eventType !== 'meeting',
      },
      {
        key: 'sponsors',
        label: 'Sponsors',
        component: 'repeatable-list',
        addLabel: 'Add sponsor',
        itemTitle: 'Sponsor',
        itemSchema: [
          { key: 'name', label: 'Sponsor Name', component: 'input', required: true },
          {
            key: 'contribution',
            label: 'Contribution',
            component: 'textarea',
            rows: 3,
          },
          {
            key: 'website',
            label: 'Website',
            component: 'input',
            type: 'url',
            placeholder: 'https://example.org',
          },
        ],
        fullWidth: true,
        visibleWhen: (model) => model.eventType !== 'meeting',
      },
      {
        component: 'section',
        label: 'Event Guest of Honors',
        description:
          'Add ceremonial or senior guests for launches, conferences, outreach programmes, and formal events.',
        visibleWhen: (model) =>
          ['conference', 'launch', 'ceremony', 'outreach'].includes(model.eventType),
      },
      {
        key: 'guestOfHonors',
        label: 'Guest of Honors',
        component: 'repeatable-list',
        addLabel: 'Add guest of honor',
        itemTitle: 'Guest of Honor',
        itemSchema: [
          { key: 'name', label: 'Full Name', component: 'input', required: true },
          { key: 'title', label: 'Title', component: 'input' },
          { key: 'organization', label: 'Organization', component: 'input' },
          { key: 'notes', label: 'Notes', component: 'textarea', rows: 3 },
        ],
        fullWidth: true,
        visibleWhen: (model) =>
          ['conference', 'launch', 'ceremony', 'outreach'].includes(model.eventType),
      },
      {
        component: 'section',
        label: 'Event Special Guests',
        description:
          'Capture special guests or supporting participants without forcing them into the core event information step.',
        visibleWhen: (model) => model.eventType !== 'meeting',
      },
      {
        key: 'specialGuests',
        label: 'Special Guests',
        component: 'repeatable-list',
        addLabel: 'Add special guest',
        itemTitle: 'Special Guest',
        itemSchema: [
          { key: 'name', label: 'Full Name', component: 'input', required: true },
          { key: 'title', label: 'Title', component: 'input' },
          { key: 'organization', label: 'Organization', component: 'input' },
          { key: 'notes', label: 'Notes', component: 'textarea', rows: 3 },
        ],
        fullWidth: true,
        visibleWhen: (model) => model.eventType !== 'meeting',
      },
    ],
    defaultForm: () => ({
      title: '',
      description: '',
      coverImage: null,
      eventType: 'general',
      targetAudience: [],
      tags: [],
      occurrences: [createEventOccurrenceFormItem()],
      schedule: [],
      sponsors: [],
      guestOfHonors: [],
      specialGuests: [],
      publicationStatus: 'draft',
      isFeatured: false,
    }),
    mapRecordToForm(record = {}) {
      return {
        title: record.title || '',
        description: record.description || '',
        coverImage: record?.coverImage || null,
        eventType: record.eventType || 'general',
        targetAudience: Array.isArray(record?.targetAudience) ? record.targetAudience : [],
        tags: Array.isArray(record?.tags) ? record.tags : [],
        occurrences: toEventOccurrenceFormItems(record?.occurrences),
        schedule: toEventScheduleFormItems(record),
        sponsors: toEventSponsorFormItems(record?.sponsors),
        guestOfHonors: toEventPeopleFormItems(record?.guestOfHonors),
        specialGuests: toEventPeopleFormItems(record?.specialGuests),
        publicationStatus: record.publicationStatus || 'draft',
        isFeatured: Boolean(record.isFeatured),
      }
    },
    mapFormToPayload(form) {
      const schedule = buildEventScheduleItems(form.schedule, form?.occurrences?.[0]?.startDate)
      const occurrences = buildEventOccurrences(form.occurrences, schedule)
      const sponsors = buildEventSponsorItems(form.sponsors)
      const guestOfHonors = buildEventPeopleItems(form.guestOfHonors)
      const specialGuests = buildEventPeopleItems(form.specialGuests)
      const venues = occurrences.map((occurrence) => occurrence?.venue).filter(Boolean)

      return {
        title: form.title,
        description: form.description,
        eventType: form.eventType || 'general',
        coverImage: form.coverImage || null,
        targetAudience: normalizeTagList(form.targetAudience),
        tags: normalizeTagList(form.tags),
        publicationStatus: form.publicationStatus || 'draft',
        isFeatured: Boolean(form.isFeatured),
        occurrences,
        schedule,
        venues,
        sponsors,
        guestOfHonors,
        specialGuests,
      }
    },
    adapter: {
      list: (query) => eventsAPI.listEvents(query),
      listPublished: (query) => eventsAPI.listPublishedEvents(query),
      find: (id) => eventsAPI.findEvent({ eventId: id }),
      create: (payload) => eventsAPI.createEvent({ eventInfo: payload }),
      update: (id, payload) => eventsAPI.updateEvent({ eventId: id, ...payload }),
      remove: (id) => eventsAPI.deleteEvent({ eventId: id }),
      listArchived: (query) => eventsAPI.listArchivedEvents(query),
      submit: (id) => eventsAPI.submitEventForApproval({ eventId: id }),
      approve: (id) => eventsAPI.approveEvent({ eventId: id }),
      reject: (id, { reason } = {}) => eventsAPI.rejectEvent({ eventId: id, reason }),
      publish: (id) => eventsAPI.publishEvent({ eventId: id }),
      unpublish: (id) => eventsAPI.unpublishEvent({ eventId: id }),
      schedulePublish: (id, payload = {}) =>
        eventsAPI.scheduleEventPublish({ eventId: id, ...payload }),
      scheduleUnpublish: (id, payload = {}) =>
        eventsAPI.scheduleEventUnpublish({ eventId: id, ...payload }),
      cancelPublishSchedule: (id) => eventsAPI.cancelEventPublishSchedule({ eventId: id }),
      cancelUnpublishSchedule: (id) => eventsAPI.cancelEventUnpublishSchedule({ eventId: id }),
      archive: (id, { reason } = {}) => eventsAPI.archiveEvent({ eventId: id, reason }),
      restore: (id) => eventsAPI.restoreEvent({ eventId: id }),
      restoreArchived: (id) => eventsAPI.restoreArchivedEvent({ eventId: id }),
      softDelete: (id, { reason } = {}) => eventsAPI.softDeleteEvent({ eventId: id, reason }),
      bulkPublish: ({ ids } = {}) => eventsAPI.publishEvents({ ids }),
      bulkUnpublish: ({ ids } = {}) => eventsAPI.unpublishEvents({ ids }),
      bulkSchedulePublish: ({ items } = {}) => eventsAPI.scheduleEventsPublish({ items }),
      bulkScheduleUnpublish: ({ items } = {}) => eventsAPI.scheduleEventsUnpublish({ items }),
      bulkCancelPublishSchedule: ({ ids } = {}) => eventsAPI.cancelEventsPublishSchedule({ ids }),
      bulkCancelUnpublishSchedule: ({ ids } = {}) =>
        eventsAPI.cancelEventsUnpublishSchedule({ ids }),
      bulkArchive: ({ ids, reason } = {}) => eventsAPI.archiveEvents({ ids, reason }),
      bulkRestore: ({ ids } = {}) => eventsAPI.restoreEvents({ ids }),
      bulkRestoreArchived: ({ ids } = {}) => eventsAPI.restoreArchivedEvents({ ids }),
      bulkSoftDelete: ({ ids, reason } = {}) => eventsAPI.softDeleteEvents({ ids, reason }),
      bulkRemove: ({ ids } = {}) => eventsAPI.deleteEvents({ ids }),
      mapItems: (response) => response?.events || response?.items || response?.data || [],
      mapEntity: (response) => response?.event || response || null,
      getId: (record) => record?.eventId || null,
    },
  },

  articles: {
    key: 'articles',
    label: 'Articles',
    singular: 'Article',
    overview: {
      description:
        'Manage editorial articles with workflow visibility, bulletin targeting, and feature readiness in one standardized overview.',
    },
    wizard: {
      enabled: true,
    },
    routeParam: 'articleId',
    idKey: 'articleId',
    routes: {
      list: 'articles.list',
      create: 'articles.create',
      details: 'articles.details',
      edit: 'articles.edit',
    },
    searchPlaceholder: 'Search articles by title, slug, status, or tags',
    columns: [
      { key: 'articleId', label: 'Article ID', minWidth: 180 },
      {
        key: 'title',
        label: 'Title (EN)',
        minWidth: 220,
        formatter: (row) => row?.title?.en || row?.title || '-',
      },
      { key: 'slug', label: 'Slug', minWidth: 180 },
      { key: 'publicationStatus', label: 'Status', minWidth: 120 },
      {
        key: 'isBulletin',
        label: 'Bulletin',
        minWidth: 100,
        formatter: (row) => (row?.isBulletin ? 'Yes' : 'No'),
      },
      {
        key: 'isFeatured',
        label: 'Featured',
        minWidth: 100,
        formatter: (row) => (row?.isFeatured ? 'Yes' : 'No'),
      },
    ],
    detailFields: [
      { key: 'articleId', label: 'Article ID' },
      {
        key: 'title',
        label: 'Title (EN)',
        formatter: (row) => row?.title?.en || '-',
      },
      {
        key: 'title',
        label: 'Title (SW)',
        formatter: (row) => row?.title?.sw || '-',
      },
      {
        key: 'description',
        label: 'Summary (EN)',
        formatter: (row) => row?.description?.en || '-',
      },
      {
        key: 'description',
        label: 'Summary (SW)',
        formatter: (row) => row?.description?.sw || '-',
      },
      {
        key: 'body',
        label: 'Body (EN)',
        formatter: (row) => row?.body?.en || '-',
      },
      {
        key: 'body',
        label: 'Body (SW)',
        formatter: (row) => row?.body?.sw || '-',
      },
      { key: 'slug', label: 'Slug' },
      {
        key: 'tags',
        label: 'Tags',
        formatter: (row) =>
          Array.isArray(row?.tags) && row.tags.length ? row.tags.join(', ') : '-',
      },
      { key: 'publicationStatus', label: 'Status' },
      {
        key: 'isBulletin',
        label: 'Bulletin / Latest News',
        formatter: (row) => (row?.isBulletin ? 'Yes' : 'No'),
      },
      {
        key: 'featureRequested',
        label: 'Feature Requested',
        formatter: (row) => (row?.featureRequested ? 'Yes' : 'No'),
      },
      {
        key: 'isFeatured',
        label: 'Featured',
        formatter: (row) => (row?.isFeatured ? 'Yes' : 'No'),
      },
    ],
    formSchema: [
      {
        component: 'section',
        label: 'Basic Information',
        description:
          'Set the bilingual headline and URL slug used across article listings and detail pages.',
      },
      { key: 'titleEn', label: 'Title (English)', required: true, component: 'input' },
      { key: 'titleSw', label: 'Title (Swahili)', required: true, component: 'input' },
      { key: 'slug', label: 'Slug', component: 'input', placeholder: 'market-update' },
      {
        component: 'section',
        label: 'Summary and Body',
        description: 'Write the bilingual summary and full article content.',
      },
      {
        key: 'descriptionEn',
        label: 'Summary (English)',
        required: true,
        component: 'textarea',
      },
      {
        key: 'descriptionSw',
        label: 'Summary (Swahili)',
        required: true,
        component: 'textarea',
      },
      {
        key: 'bodyEn',
        label: 'Body (English)',
        component: 'textarea',
        rows: 6,
        fullWidth: true,
      },
      {
        key: 'bodySw',
        label: 'Body (Swahili)',
        component: 'textarea',
        rows: 6,
        fullWidth: true,
      },
      {
        component: 'section',
        label: 'Publishing',
        description: 'Configure tags, workflow state, and bulletin prominence before publishing.',
      },
      { key: 'tagsText', label: 'Tags (comma separated)', component: 'textarea' },
      {
        key: 'publicationStatus',
        label: 'Status',
        component: 'select',
        options: STATUS_OPTIONS,
      },
      { key: 'isBulletin', label: 'Bulletin / Latest News', component: 'switch' },
      {
        key: 'featureRequested',
        label: 'Request Feature on Publish',
        component: 'switch',
        helpText:
          'Enable this when editors want publishing reviewers to consider the article for featured placement.',
      },
    ],
    defaultForm: () => ({
      titleEn: '',
      titleSw: '',
      descriptionEn: '',
      descriptionSw: '',
      bodyEn: '',
      bodySw: '',
      slug: '',
      tagsText: '',
      publicationStatus: 'draft',
      isBulletin: false,
      featureRequested: false,
    }),
    mapRecordToForm(record = {}) {
      return {
        titleEn: record?.title?.en || '',
        titleSw: record?.title?.sw || '',
        descriptionEn: record?.description?.en || '',
        descriptionSw: record?.description?.sw || '',
        bodyEn: record?.body?.en || '',
        bodySw: record?.body?.sw || '',
        slug: record?.slug || '',
        tagsText: Array.isArray(record?.tags) ? record.tags.join(', ') : '',
        publicationStatus: record?.publicationStatus || 'draft',
        isBulletin: Boolean(record?.isBulletin),
        featureRequested: Boolean(record?.featureRequested),
      }
    },
    mapFormToPayload(form) {
      return {
        title: {
          en: form.titleEn,
          sw: form.titleSw,
        },
        description: {
          en: form.descriptionEn,
          sw: form.descriptionSw,
        },
        body: {
          en: form.bodyEn || '',
          sw: form.bodySw || '',
        },
        slug: form.slug || null,
        tags: parseCSV(form.tagsText),
        publicationStatus: form.publicationStatus || 'draft',
        isBulletin: Boolean(form.isBulletin),
        featureRequested: Boolean(form.featureRequested),
      }
    },
    adapter: {
      list: (query) => articlesAPI.listArticles(query),
      listPublished: (query) => articlesAPI.listPublishedArticles(query),
      find: (id) => articlesAPI.findArticle({ articleId: id }),
      create: (payload) => articlesAPI.createArticle({ articleInfo: payload }),
      update: (id, payload) => articlesAPI.updateArticle({ articleId: id, ...payload }),
      remove: (id) => articlesAPI.deleteArticle({ articleId: id }),
      listArchived: (query) => articlesAPI.listArchivedArticles(query),
      submit: (id) => articlesAPI.submitArticleForApproval({ articleId: id }),
      approve: (id) => articlesAPI.approveArticle({ articleId: id }),
      reject: (id, { reason } = {}) => articlesAPI.rejectArticle({ articleId: id, reason }),
      publish: (id) => articlesAPI.publishArticle({ articleId: id }),
      unpublish: (id) => articlesAPI.unpublishArticle({ articleId: id }),
      schedulePublish: (id, payload = {}) =>
        articlesAPI.scheduleArticlePublish({ articleId: id, ...payload }),
      scheduleUnpublish: (id, payload = {}) =>
        articlesAPI.scheduleArticleUnpublish({ articleId: id, ...payload }),
      cancelPublishSchedule: (id) => articlesAPI.cancelArticlePublishSchedule({ articleId: id }),
      cancelUnpublishSchedule: (id) =>
        articlesAPI.cancelArticleUnpublishSchedule({ articleId: id }),
      archive: (id, { reason } = {}) => articlesAPI.archiveArticle({ articleId: id, reason }),
      restore: (id) => articlesAPI.restoreArticle({ articleId: id }),
      restoreArchived: (id) => articlesAPI.restoreArchivedArticle({ articleId: id }),
      softDelete: (id, { reason } = {}) => articlesAPI.softDeleteArticle({ articleId: id, reason }),
      bulkPublish: ({ ids } = {}) => articlesAPI.publishArticles({ ids }),
      bulkUnpublish: ({ ids } = {}) => articlesAPI.unpublishArticles({ ids }),
      bulkSchedulePublish: ({ items } = {}) => articlesAPI.scheduleArticlesPublish({ items }),
      bulkScheduleUnpublish: ({ items } = {}) => articlesAPI.scheduleArticlesUnpublish({ items }),
      bulkCancelPublishSchedule: ({ ids } = {}) =>
        articlesAPI.cancelArticlesPublishSchedule({ ids }),
      bulkCancelUnpublishSchedule: ({ ids } = {}) =>
        articlesAPI.cancelArticlesUnpublishSchedule({ ids }),
      bulkArchive: ({ ids, reason } = {}) => articlesAPI.archiveArticles({ ids, reason }),
      bulkRestore: ({ ids } = {}) => articlesAPI.restoreArticles({ ids }),
      bulkRestoreArchived: ({ ids } = {}) => articlesAPI.restoreArchivedArticles({ ids }),
      bulkSoftDelete: ({ ids, reason } = {}) => articlesAPI.softDeleteArticles({ ids, reason }),
      bulkRemove: ({ ids } = {}) => articlesAPI.deleteArticles({ ids }),
      mapItems: (response) => response?.data || response?.items || response?.articles || [],
      mapEntity: (response) => response?.article || response || null,
      getId: (record) => record?.articleId || null,
    },
  },

  publications: {
    key: 'publications',
    label: 'Publications',
    singular: 'Publication',
    overview: {
      description:
        'Track publication inventory, category assignment, issue dates, and workflow state from one editorial workspace.',
      extraFilters: [
        {
          key: 'categoryId',
          label: 'Category',
          type: 'select',
          placeholder: 'All Categories',
          loadOptions: loadPublicationCategoryOptions,
        },
      ],
    },
    wizard: false,
    routeParam: 'publicationId',
    idKey: 'publicationId',
    routes: {
      list: 'publications.list',
      create: 'publications.create',
      details: 'publications.details',
      edit: 'publications.edit',
    },
    searchPlaceholder: 'Search publications by title, category, or status',
    columns: [
      {
        key: 'name',
        label: 'Name',
        minWidth: 250,
        formatter: (row) => row?.name?.en || row?.name || '-',
      },
      {
        key: 'category',
        label: 'Category',
        minWidth: 200,
        formatter: (row) => row?.category?.name?.en || row?.category?.name || row?.category || '-',
      },
      {
        key: 'issueDate',
        label: 'Issue Date',
        minWidth: 130,
        formatter: (row) => toISODate(row.issueDate) || '-',
      },
      { key: 'effectiveStatus', label: 'Status', minWidth: 140 },
      {
        key: 'updatedAt',
        label: 'Updated',
        minWidth: 170,
      },
    ],
    detailFields: [
      { key: 'publicationId', label: 'Publication ID' },
      {
        key: 'name',
        label: 'Name (EN)',
        formatter: (row) => row?.name?.en || '-',
      },
      {
        key: 'name',
        label: 'Name (SW)',
        formatter: (row) => row?.name?.sw || '-',
      },
      {
        key: 'description',
        label: 'Description (EN)',
        formatter: (row) => row?.description?.en || '-',
      },
      {
        key: 'description',
        label: 'Description (SW)',
        formatter: (row) => row?.description?.sw || '-',
      },
      {
        key: 'category',
        label: 'Category',
        formatter: (row) => row?.category?.name?.en || row?.category || '-',
      },
      { key: 'effectiveStatus', label: 'Workflow Status' },
      {
        key: 'issueDate',
        label: 'Issue Date',
        formatter: (row) => toISODate(row.issueDate) || '-',
      },
      { key: 'validFrom', label: 'Visible From' },
      { key: 'validUntil', label: 'Visible Until' },
      { key: 'updatedAt', label: 'Last Updated' },
    ],
    formSchema: [
      {
        component: 'section',
        label: 'Basic Information',
        description: 'Set the bilingual publication name used in admin and public listings.',
      },
      { key: 'nameEn', label: 'Name (English)', required: true, component: 'input' },
      { key: 'nameSw', label: 'Name (Swahili)', required: true, component: 'input' },
      {
        component: 'section',
        label: 'Description',
        description: 'Write the bilingual publication summary.',
      },
      {
        key: 'descriptionEn',
        label: 'Description (English)',
        required: true,
        component: 'textarea',
      },
      {
        key: 'descriptionSw',
        label: 'Description (Swahili)',
        required: true,
        component: 'textarea',
      },
      {
        component: 'section',
        label: 'Relationships',
        description: 'Assign the publication category by name instead of pasting internal IDs.',
      },
      {
        key: 'category',
        label: 'Publication Category',
        required: true,
        component: 'entity-select',
        placeholder: 'Select publication category',
        helpText: 'Choose a category by name. The selected category ID is stored automatically.',
        loadOptions: loadPublicationCategoryOptions,
        createRoute: 'publicationCategories.create',
      },
      {
        component: 'section',
        label: 'Supporting Materials',
        description:
          'Add editorial tags and attach PDF documents that will travel with this publication.',
      },
      {
        key: 'tags',
        label: 'Tags',
        component: 'tag-input',
        placeholder: 'Add a tag and press Enter',
        helpText: 'Use short labels such as regulations, annual report, or public notice.',
      },
      {
        key: 'documents',
        label: 'PDF Attachments',
        component: 'file-upload',
        accept: '.pdf,application/pdf',
        multiple: true,
        limit: 8,
        uploadTitle: 'Drop PDF files here or click to choose them',
        uploadHint: 'Attach official publication files in PDF format only.',
        tip: 'Only PDF files are accepted for publication attachments.',
        helpText: 'These files appear as downloadable publication attachments.',
      },
      {
        component: 'section',
        label: 'Availability',
        description:
          'Capture issue dates and public visibility windows. Use the schedule screen to publish immediately or later.',
      },
      { key: 'issueDate', label: 'Issue Date', component: 'date' },
      { key: 'validFrom', label: 'Valid From', component: 'date' },
      { key: 'validUntil', label: 'Valid Until', component: 'date' },
    ],
    defaultForm: () => ({
      nameEn: '',
      nameSw: '',
      descriptionEn: '',
      descriptionSw: '',
      category: '',
      tags: [],
      documents: [],
      issueDate: '',
      validFrom: '',
      validUntil: '',
      publicationStatus: 'draft',
    }),
    mapRecordToForm(record = {}) {
      return {
        nameEn: record?.name?.en || '',
        nameSw: record?.name?.sw || '',
        descriptionEn: record?.description?.en || '',
        descriptionSw: record?.description?.sw || '',
        category:
          record?.category?._id ||
          record?.category?.categoryId ||
          record?.category?.id ||
          record?.category ||
          '',
        tags: Array.isArray(record?.tags) ? record.tags : [],
        documents: [],
        issueDate: toISODate(record.issueDate),
        validFrom: toISODate(record.validFrom),
        validUntil: toISODate(record.validUntil),
        publicationStatus: record.publicationStatus || 'draft',
      }
    },
    mapFormToPayload(form) {
      return {
        name: { en: form.nameEn, sw: form.nameSw },
        description: { en: form.descriptionEn, sw: form.descriptionSw },
        category: form.category,
        tags: normalizeTagList(form.tags),
        documents: Array.isArray(form.documents)
          ? form.documents
          : form.documents
            ? [form.documents]
            : [],
        issueDate: form.issueDate || null,
        validFrom: form.validFrom || null,
        validUntil: form.validUntil || null,
        publicationStatus: form.publicationStatus || 'draft',
      }
    },
    adapter: {
      list: (query) => publicationsAPI.listPublications(query),
      listPublished: (query) => publicationsAPI.listPublishedPublications(query),
      find: (id) => publicationsAPI.findPublication({ publicationId: id }),
      create: (payload) => publicationsAPI.createPublication({ publicationInfo: payload }),
      update: (id, payload) => publicationsAPI.updatePublication({ publicationId: id, ...payload }),
      remove: (id) => publicationsAPI.deletePublication({ publicationId: id }),
      submit: (id) => publicationsAPI.submitPublicationForApproval({ publicationId: id }),
      approve: (id) => publicationsAPI.approvePublication({ publicationId: id }),
      reject: (id, { reason } = {}) =>
        publicationsAPI.rejectPublication({ publicationId: id, reason }),
      publish: (id) => publicationsAPI.publishPublication({ publicationId: id }),
      unpublish: (id) => publicationsAPI.unpublishPublication({ publicationId: id }),
      schedulePublish: (id, payload = {}) =>
        publicationsAPI.schedulePublicationPublish({ publicationId: id, ...payload }),
      scheduleUnpublish: (id, payload = {}) =>
        publicationsAPI.schedulePublicationUnpublish({ publicationId: id, ...payload }),
      cancelPublishSchedule: (id) =>
        publicationsAPI.cancelPublicationPublishSchedule({ publicationId: id }),
      cancelUnpublishSchedule: (id) =>
        publicationsAPI.cancelPublicationUnpublishSchedule({ publicationId: id }),
      archive: (id, { reason } = {}) =>
        publicationsAPI.archivePublication({ publicationId: id, reason }),
      softDelete: (id, { reason } = {}) =>
        publicationsAPI.softDeletePublication({ publicationId: id, reason }),
      restore: (id) => publicationsAPI.restorePublication({ publicationId: id }),
      restoreArchived: (id) => publicationsAPI.restoreArchivedPublication({ publicationId: id }),
      bulkPublish: ({ ids } = {}) => publicationsAPI.publishPublications({ ids }),
      bulkUnpublish: ({ ids } = {}) => publicationsAPI.unpublishPublications({ ids }),
      bulkSchedulePublish: ({ items } = {}) =>
        publicationsAPI.schedulePublicationsPublish({ items }),
      bulkScheduleUnpublish: ({ items } = {}) =>
        publicationsAPI.schedulePublicationsUnpublish({ items }),
      bulkCancelPublishSchedule: ({ ids } = {}) =>
        publicationsAPI.cancelPublicationsPublishSchedule({ ids }),
      bulkCancelUnpublishSchedule: ({ ids } = {}) =>
        publicationsAPI.cancelPublicationsUnpublishSchedule({ ids }),
      bulkArchive: ({ ids, reason } = {}) => publicationsAPI.archivePublications({ ids, reason }),
      bulkRestore: ({ ids } = {}) => publicationsAPI.restorePublications({ ids }),
      bulkRestoreArchived: ({ ids } = {}) => publicationsAPI.restoreArchivedPublications({ ids }),
      bulkSoftDelete: ({ ids, reason } = {}) =>
        publicationsAPI.softDeletePublications({ ids, reason }),
      bulkRemove: ({ ids } = {}) => publicationsAPI.deletePublications({ ids }),
      mapItems: (response) => response?.items || response?.publications || [],
      mapEntity: (response) => response?.publication || response || null,
      getId: (record) => record?.publicationId || null,
    },
  },

  publicationCategories: {
    key: 'publicationCategories',
    label: 'Publication Categories',
    singular: 'Publication Category',
    overview: {
      description:
        'Manage publication category rules, validity policies, and publishing state as a first-class admin module.',
    },
    wizard: false,
    routeParam: 'categoryId',
    idKey: 'categoryId',
    routes: {
      list: 'publicationCategories.list',
      create: 'publicationCategories.create',
      details: 'publicationCategories.details',
      edit: 'publicationCategories.edit',
    },
    searchPlaceholder: 'Search publication categories by name, key, or status',
    columns: [
      { key: 'systemKey', label: 'System Key', minWidth: 190 },
      {
        key: 'name',
        label: 'Category',
        minWidth: 220,
        formatter: (row) => row?.name?.en || row?.name?.sw || '-',
      },
      { key: 'validityType', label: 'Validity Type', minWidth: 130 },
      { key: 'effectiveStatus', label: 'Status', minWidth: 140 },
      {
        key: 'publicationCount',
        label: 'Publications',
        minWidth: 120,
      },
      {
        key: 'publishedPublicationCount',
        label: 'Published',
        minWidth: 120,
      },
      {
        key: 'updatedAt',
        label: 'Updated',
        minWidth: 170,
      },
    ],
    detailFields: [
      { key: 'categoryId', label: 'Category ID' },
      { key: 'systemKey', label: 'System Key' },
      {
        key: 'name',
        label: 'Name (EN)',
        formatter: (row) => row?.name?.en || '-',
      },
      {
        key: 'name',
        label: 'Name (SW)',
        formatter: (row) => row?.name?.sw || '-',
      },
      {
        key: 'description',
        label: 'Description (EN)',
        formatter: (row) => row?.description?.en || '-',
      },
      {
        key: 'description',
        label: 'Description (SW)',
        formatter: (row) => row?.description?.sw || '-',
      },
      { key: 'effectiveStatus', label: 'Workflow Status' },
      { key: 'validityType', label: 'Validity Type' },
      {
        key: 'validityDurationDays',
        label: 'Validity Duration (days)',
        formatter: (row) =>
          row?.validityType === 'time-bound' ? String(row?.validityDurationDays || '-') : 'N/A',
      },
      {
        key: 'tags',
        label: 'Tags',
        formatter: (row) =>
          Array.isArray(row?.tags) && row.tags.length ? row.tags.join(', ') : '-',
      },
      { key: 'publicationCount', label: 'Linked Publications' },
      { key: 'publishedPublicationCount', label: 'Published Publications' },
      { key: 'updatedAt', label: 'Last Updated' },
    ],
    formSchema: [
      {
        component: 'section',
        label: 'Identity',
        description: 'Define the category key and bilingual titles used by publication editors.',
      },
      {
        key: 'systemKey',
        label: 'System Key',
        component: 'input',
        placeholder: 'legal-frameworks',
      },
      { key: 'nameEn', label: 'Name (English)', required: true, component: 'input' },
      { key: 'nameSw', label: 'Name (Swahili)', required: true, component: 'input' },
      {
        component: 'section',
        label: 'Description',
        description: 'Explain what kind of publications belong in this category.',
      },
      {
        key: 'descriptionEn',
        label: 'Description (English)',
        required: true,
        component: 'textarea',
      },
      {
        key: 'descriptionSw',
        label: 'Description (Swahili)',
        required: true,
        component: 'textarea',
      },
      {
        component: 'section',
        label: 'Validity Rules',
        description:
          'Define whether publications in this category expire automatically and how editors should classify them.',
      },
      {
        key: 'validityType',
        label: 'Validity Type',
        component: 'select',
        options: CATEGORY_VALIDITY_OPTIONS,
      },
      {
        key: 'validityDurationDays',
        label: 'Validity Duration (days)',
        component: 'input',
        type: 'number',
        visibleWhen: { validityType: 'time-bound' },
        helpText: 'Only required when the category is time-bound.',
      },
      {
        key: 'tags',
        label: 'Category Tags',
        component: 'tag-input',
        placeholder: 'Add a tag and press Enter',
        helpText: 'Use tags to group similar categories for editors.',
      },
    ],
    defaultForm: () => ({
      systemKey: '',
      nameEn: '',
      nameSw: '',
      descriptionEn: '',
      descriptionSw: '',
      validityType: 'permanent',
      validityDurationDays: '',
      tags: [],
      publicationStatus: 'draft',
    }),
    mapRecordToForm(record = {}) {
      return {
        systemKey: record?.systemKey || '',
        nameEn: record?.name?.en || '',
        nameSw: record?.name?.sw || '',
        descriptionEn: record?.description?.en || '',
        descriptionSw: record?.description?.sw || '',
        validityType: record?.validityType || 'permanent',
        validityDurationDays:
          record?.validityType === 'time-bound' && record?.validityDurationDays
            ? String(record.validityDurationDays)
            : '',
        tags: Array.isArray(record?.tags) ? record.tags : [],
        publicationStatus: record?.publicationStatus || 'draft',
      }
    },
    mapFormToPayload(form) {
      const validityDurationDays =
        form.validityType === 'time-bound' && Number(form.validityDurationDays) > 0
          ? Number(form.validityDurationDays)
          : null

      return {
        systemKey: normalizeSystemKey(form.systemKey || form.nameEn),
        name: { en: form.nameEn, sw: form.nameSw },
        description: { en: form.descriptionEn, sw: form.descriptionSw },
        validityType: form.validityType || 'permanent',
        validityDurationDays,
        tags: normalizeTagList(form.tags),
        publicationStatus: form.publicationStatus || 'draft',
      }
    },
    adapter: {
      list: (query) => publicationsAPI.listPublicationCategories(query),
      listPublished: (query) => publicationsAPI.listPublishedCategories(query),
      find: (id) => publicationsAPI.findPublicationCategory({ categoryId: id }),
      create: (payload) => publicationsAPI.createPublicationCategory(payload),
      update: (id, payload) =>
        publicationsAPI.updatePublicationCategory({ categoryId: id, ...payload }),
      remove: (id) => publicationsAPI.deletePublicationCategory({ categoryId: id }),
      submit: (id) => publicationsAPI.submitPublicationCategoryForApproval({ categoryId: id }),
      approve: (id) => publicationsAPI.approvePublicationCategory({ categoryId: id }),
      listArchived: (query) => publicationsAPI.listArchivedCategories(query),
      reject: (id, { reason } = {}) =>
        publicationsAPI.rejectPublicationCategory({ categoryId: id, reason }),
      publish: (id) => publicationsAPI.publishCategory({ categoryId: id }),
      unpublish: (id) => publicationsAPI.unpublishCategory({ categoryId: id }),
      schedulePublish: (id, payload = {}) =>
        publicationsAPI.schedulePublicationCategoryPublish({ categoryId: id, ...payload }),
      scheduleUnpublish: (id, payload = {}) =>
        publicationsAPI.schedulePublicationCategoryUnpublish({ categoryId: id, ...payload }),
      cancelPublishSchedule: (id) =>
        publicationsAPI.cancelPublicationCategoryPublishSchedule({ categoryId: id }),
      cancelUnpublishSchedule: (id) =>
        publicationsAPI.cancelPublicationCategoryUnpublishSchedule({ categoryId: id }),
      archive: (id, { reason } = {}) => publicationsAPI.archiveCategory({ categoryId: id, reason }),
      softDelete: (id, { reason } = {}) =>
        publicationsAPI.softDeleteCategory({ categoryId: id, reason }),
      restore: (id) => publicationsAPI.restoreCategory({ categoryId: id }),
      restoreArchived: (id) => publicationsAPI.restoreArchivedCategory({ categoryId: id }),
      bulkPublish: ({ ids } = {}) => publicationsAPI.publishCategories({ ids }),
      bulkUnpublish: ({ ids } = {}) => publicationsAPI.unpublishCategories({ ids }),
      bulkSchedulePublish: ({ items } = {}) =>
        publicationsAPI.schedulePublicationCategoriesPublish({ items }),
      bulkScheduleUnpublish: ({ items } = {}) =>
        publicationsAPI.schedulePublicationCategoriesUnpublish({ items }),
      bulkCancelPublishSchedule: ({ ids } = {}) =>
        publicationsAPI.cancelPublicationCategoriesPublishSchedule({ ids }),
      bulkCancelUnpublishSchedule: ({ ids } = {}) =>
        publicationsAPI.cancelPublicationCategoriesUnpublishSchedule({ ids }),
      bulkArchive: ({ ids, reason } = {}) => publicationsAPI.archiveCategories({ ids, reason }),
      bulkRestore: ({ ids } = {}) => publicationsAPI.restoreCategories({ ids }),
      bulkRestoreArchived: ({ ids } = {}) => publicationsAPI.restoreArchivedCategories({ ids }),
      bulkSoftDelete: ({ ids, reason } = {}) =>
        publicationsAPI.softDeleteCategories({ ids, reason }),
      bulkRemove: ({ ids } = {}) => publicationsAPI.deletePublicationCategories({ ids }),
      mapItems: (response) => response?.categories || response?.items || [],
      mapEntity: (response) => response?.category || response || null,
      getId: (record) => record?.categoryId || null,
    },
  },

  directorates: {
    key: 'directorates',
    label: 'Directorates',
    singular: 'Directorate',
    overview: {
      description:
        'Manage directorate structure, leadership content, and publishing state with one consistent admin overview.',
    },
    wizard: {
      enabled: true,
    },
    routeParam: 'directorateId',
    idKey: 'directorateId',
    routes: {
      list: 'directorates.list',
      create: 'directorates.create',
      details: 'directorates.details',
      edit: 'directorates.edit',
    },
    searchPlaceholder: 'Search directorate by name or code',
    columns: [
      { key: 'directorateId', label: 'Directorate ID', minWidth: 170 },
      {
        key: 'name',
        label: 'Name',
        minWidth: 220,
        formatter: (row) => toLocalizedPreview(row?.name),
      },
      { key: 'code', label: 'Code', minWidth: 130 },
      { key: 'publicationStatus', label: 'Status', minWidth: 120 },
    ],
    detailFields: [
      { key: 'directorateId', label: 'Directorate ID' },
      ...buildStructureDetailFields('Director'),
    ],
    formSchema: buildStructureFormSchema({
      rolePrefix: 'director',
      roleTitle: 'Director',
      roleRequiredWhen: () => true,
      profilePictureRequiredWhen: () => true,
      coverImageRequiredWhen: () => true,
    }),
    defaultForm: () =>
      defaultStructureForm({
        rolePrefix: 'director',
      }),
    mapRecordToForm(record = {}) {
      return mapStructureRecordToForm(record, {
        rolePrefix: 'director',
      })
    },
    mapFormToPayload(form) {
      return mapStructureFormToPayload(form, {
        rolePrefix: 'director',
      })
    },
    adapter: {
      list: (query) => directoratesAPI.listDirectorates(query),
      find: (id) => directoratesAPI.findDirectorate({ directorateId: id }),
      create: (payload) => directoratesAPI.createDirectorate(payload),
      update: (id, payload) => directoratesAPI.updateDirectorate({ directorateId: id, ...payload }),
      remove: (id) => directoratesAPI.deleteDirectorate({ directorateId: id }),
      ...buildGenericWorkflowAdapter(directoratesAPI),
      mapItems: (response) => mapCollection(response, ['directorates']),
      mapEntity: (response) => mapEntityByKey(response, 'directorate'),
      getId: (record) => record?.directorateId || record?._id || null,
    },
  },

  sections: {
    key: 'sections',
    label: 'Sections',
    singular: 'Section',
    overview: {
      description:
        'Coordinate section structure, parent directorate assignment, and manager content through a guided workflow.',
    },
    wizard: {
      enabled: true,
    },
    routeParam: 'sectionId',
    idKey: 'sectionId',
    routes: {
      list: 'sections.list',
      create: 'sections.create',
      details: 'sections.details',
      edit: 'sections.edit',
    },
    searchPlaceholder: 'Search section by name or code',
    columns: [
      { key: 'sectionId', label: 'Section ID', minWidth: 160 },
      {
        key: 'name',
        label: 'Name',
        minWidth: 220,
        formatter: (row) => toLocalizedPreview(row?.name),
      },
      { key: 'code', label: 'Code', minWidth: 130 },
      {
        key: 'directorate',
        label: 'Directorate',
        minWidth: 180,
        formatter: (row) => toLocalizedPreview(row?.directorate?.name || row?.directorate),
      },
      { key: 'publicationStatus', label: 'Status', minWidth: 120 },
    ],
    detailFields: [
      { key: 'sectionId', label: 'Section ID' },
      {
        key: 'directorate',
        label: 'Directorate',
        formatter: (row) => toLocalizedPreview(row?.directorate?.name || row?.directorate),
      },
      ...buildStructureDetailFields('Manager'),
    ],
    formSchema: buildStructureFormSchema({
      rolePrefix: 'manager',
      roleTitle: 'Manager',
      includeDirectorate: true,
      roleRequiredWhen: () => true,
      profilePictureRequiredWhen: () => true,
      coverImageRequiredWhen: () => true,
    }),
    defaultForm: () =>
      defaultStructureForm({
        rolePrefix: 'manager',
        includeDirectorate: true,
      }),
    mapRecordToForm(record = {}) {
      return mapStructureRecordToForm(record, {
        rolePrefix: 'manager',
        includeDirectorate: true,
      })
    },
    mapFormToPayload(form) {
      return mapStructureFormToPayload(form, {
        rolePrefix: 'manager',
        includeDirectorate: true,
      })
    },
    adapter: {
      list: (query) => sectionsAPI.listSections(query),
      find: (id) => sectionsAPI.findSection({ sectionId: id }),
      create: (payload) => sectionsAPI.createSection(payload),
      update: (id, payload) => sectionsAPI.updateSection({ sectionId: id, ...payload }),
      remove: (id) => sectionsAPI.deleteSection({ sectionId: id }),
      ...buildGenericWorkflowAdapter(sectionsAPI),
      mapItems: (response) => mapCollection(response, ['sections']),
      mapEntity: (response) => mapEntityByKey(response, 'section'),
      getId: (record) => record?.sectionId || record?._id || null,
    },
  },

  units: {
    key: 'units',
    label: 'Units',
    singular: 'Unit',
    overview: {
      description:
        'Maintain units with consistent structural metadata, leadership copy, and workflow visibility.',
    },
    wizard: {
      enabled: true,
    },
    routeParam: 'unitId',
    idKey: 'unitId',
    routes: {
      list: 'units.list',
      create: 'units.create',
      details: 'units.details',
      edit: 'units.edit',
    },
    searchPlaceholder: 'Search unit by name or code',
    columns: [
      { key: 'unitId', label: 'Unit ID', minWidth: 160 },
      {
        key: 'name',
        label: 'Name',
        minWidth: 220,
        formatter: (row) => toLocalizedPreview(row?.name),
      },
      { key: 'code', label: 'Code', minWidth: 130 },
      { key: 'publicationStatus', label: 'Status', minWidth: 120 },
    ],
    detailFields: [{ key: 'unitId', label: 'Unit ID' }, ...buildStructureDetailFields('Manager')],
    formSchema: buildStructureFormSchema({
      rolePrefix: 'manager',
      roleTitle: 'Manager',
      roleRequiredWhen: () => true,
      profilePictureRequiredWhen: () => true,
      coverImageRequiredWhen: () => true,
    }),
    defaultForm: () =>
      defaultStructureForm({
        rolePrefix: 'manager',
      }),
    mapRecordToForm(record = {}) {
      return mapStructureRecordToForm(record, {
        rolePrefix: 'manager',
      })
    },
    mapFormToPayload(form) {
      return mapStructureFormToPayload(form, {
        rolePrefix: 'manager',
      })
    },
    adapter: {
      list: (query) => unitsAPI.listUnits(query),
      find: (id) => unitsAPI.findUnit({ unitId: id }),
      create: (payload) => unitsAPI.createUnit(payload),
      update: (id, payload) => unitsAPI.updateUnit({ unitId: id, ...payload }),
      remove: (id) => unitsAPI.deleteUnit({ unitId: id }),
      ...buildGenericWorkflowAdapter(unitsAPI),
      mapItems: (response) => mapCollection(response, ['units']),
      mapEntity: (response) => mapEntityByKey(response, 'unit'),
      getId: (record) => record?.unitId || record?._id || null,
    },
  },

  offices: {
    key: 'offices',
    label: 'Offices',
    singular: 'Office',
    overview: {
      description:
        'Organize office records, address/contact details, and public-facing management content consistently.',
    },
    wizard: {
      enabled: true,
    },
    routeParam: 'officeId',
    idKey: 'officeId',
    routes: {
      list: 'offices.list',
      create: 'offices.create',
      details: 'offices.details',
      edit: 'offices.edit',
    },
    searchPlaceholder: 'Search office by name or code',
    columns: [
      { key: 'officeId', label: 'Office ID', minWidth: 160 },
      {
        key: 'name',
        label: 'Name',
        minWidth: 220,
        formatter: (row) => toLocalizedPreview(row?.name),
      },
      { key: 'code', label: 'Code', minWidth: 130 },
      { key: 'type', label: 'Type', minWidth: 120 },
      { key: 'publicationStatus', label: 'Status', minWidth: 120 },
    ],
    detailFields: [
      { key: 'officeId', label: 'Office ID' },
      { key: 'type', label: 'Type' },
      ...buildStructureDetailFields('Manager'),
      {
        key: 'address',
        label: 'Address',
        formatter: (row) =>
          [
            row?.address?.physicalAddress || row?.physicalAddress,
            row?.address?.region || row?.region,
            row?.address?.district || row?.district,
          ]
            .filter(Boolean)
            .join(', ') || '-',
      },
      {
        key: 'contacts',
        label: 'Contacts',
        formatter: (row) =>
          [
            row?.contacts?.phoneNumber || row?.phoneNumber,
            row?.contacts?.email || row?.email,
            row?.contacts?.fax || row?.fax,
          ]
            .filter(Boolean)
            .join(' | ') || '-',
      },
    ],
    formSchema: buildStructureFormSchema({
      rolePrefix: 'manager',
      roleTitle: 'Manager',
      includeOfficeType: true,
      includeAddress: true,
      includeContacts: true,
      roleRequiredWhen: { type: 'zonal' },
      profilePictureRequiredWhen: { type: 'zonal' },
      coverImageRequiredWhen: { type: 'zonal' },
    }),
    defaultForm: () =>
      defaultStructureForm({
        rolePrefix: 'manager',
        includeOfficeType: true,
        includeAddress: true,
        includeContacts: true,
      }),
    mapRecordToForm(record = {}) {
      return mapStructureRecordToForm(record, {
        rolePrefix: 'manager',
        includeOfficeType: true,
        includeAddress: true,
        includeContacts: true,
      })
    },
    mapFormToPayload(form) {
      return mapStructureFormToPayload(form, {
        rolePrefix: 'manager',
        includeOfficeType: true,
        includeAddress: true,
        includeContacts: true,
      })
    },
    adapter: {
      list: (query) => officesAPI.listOffices(query),
      find: (id) => officesAPI.findOffice({ officeId: id }),
      create: (payload) => officesAPI.createOffice(payload),
      update: (id, payload) => officesAPI.updateOffice({ officeId: id, ...payload }),
      remove: (id) => officesAPI.deleteOffice({ officeId: id }),
      ...buildGenericWorkflowAdapter(officesAPI),
      mapItems: (response) => mapCollection(response, ['offices']),
      mapEntity: (response) => mapEntityByKey(response, 'office'),
      getId: (record) => record?.officeId || record?._id || null,
    },
  },

  commissioners: {
    key: 'commissioners',
    label: 'Commissioners',
    singular: 'Commissioner',
    overview: {
      description:
        'Manage commissioner profiles, designation data, and publication state with consistent overview and form patterns.',
    },
    wizard: {
      enabled: true,
    },
    routeParam: 'commissionerId',
    idKey: 'commissionerId',
    routes: {
      list: 'commissioners.list',
      create: 'commissioners.create',
      details: 'commissioners.details',
      edit: 'commissioners.edit',
    },
    searchPlaceholder: 'Search commissioner by name or designation',
    columns: [
      { key: 'commissionerId', label: 'Commissioner ID', minWidth: 170 },
      {
        key: 'fullName',
        label: 'Full Name',
        minWidth: 220,
        formatter: (row) => toFullName(row),
      },
      {
        key: 'designation',
        label: 'Designation',
        minWidth: 180,
        formatter: (row) => toLocalizedPreview(row?.designation),
      },
      { key: 'publicationStatus', label: 'Status', minWidth: 120 },
    ],
    detailFields: [
      { key: 'commissionerId', label: 'Commissioner ID' },
      {
        key: 'fullName',
        label: 'Full Name',
        formatter: (row) => toFullName(row),
      },
      {
        key: 'designation',
        label: 'Designation',
        formatter: (row) => toLocalizedPreview(row?.designation),
      },
      {
        key: 'profilePicture',
        label: 'Profile Picture',
        kind: 'image',
        formatter: (row) => extractMediaUrl(row?.profilePicture || row?.image || row?.photo),
      },
      { key: 'job', label: 'Job Title', formatter: (row) => toLocalizedPreview(row?.job) },
      { key: 'email', label: 'Email' },
      { key: 'phoneNumber', label: 'Phone Number' },
      { key: 'gender', label: 'Gender' },
      {
        key: 'statement',
        label: 'Statement',
        formatter: (row) => toLocalizedPreview(row?.statement),
      },
      {
        key: 'biography',
        label: 'Biography',
        formatter: (row) => toLocalizedPreview(row?.biography),
      },
      { key: 'publicationStatus', label: 'Status' },
    ],
    formSchema: [
      {
        component: 'section',
        label: 'Identity',
        description: 'Personal and designation details used on leadership and commissioner pages.',
      },
      { key: 'prefix', label: 'Prefix', component: 'input' },
      { key: 'firstName', label: 'First Name', required: true, component: 'input' },
      { key: 'middleName', label: 'Middle Name', component: 'input' },
      { key: 'surname', label: 'Surname', required: true, component: 'input' },
      {
        key: 'designationKey',
        label: 'Designation',
        required: true,
        component: 'select',
        options: COMMISSIONER_DESIGNATION_OPTIONS,
      },
      { key: 'email', label: 'Email', component: 'input', type: 'email' },
      { key: 'phoneNumber', label: 'Phone Number', component: 'input' },
      {
        key: 'profilePicture',
        label: 'Profile Picture',
        component: 'file-upload',
        fullWidth: true,
        multiple: false,
        limit: 1,
        accept: 'image/*',
        uploadTitle: 'Drop a commissioner profile image here or click to choose one',
        uploadHint: 'Use a clear portrait image for commissioner listings and detail pages.',
        tip: 'PNG and JPG files are accepted.',
      },
      {
        key: 'gender',
        label: 'Gender',
        component: 'select',
        options: GENDER_OPTIONS,
      },
      { key: 'jobEn', label: 'Job Title (English)', component: 'input' },
      { key: 'jobSw', label: 'Job Title (Swahili)', component: 'input' },
      {
        component: 'section',
        label: 'Content',
        description: 'Long-form profile copy and public leadership statement.',
      },
      {
        key: 'statementEn',
        label: 'Statement (English)',
        component: 'textarea',
        rows: 4,
        fullWidth: true,
      },
      {
        key: 'statementSw',
        label: 'Statement (Swahili)',
        component: 'textarea',
        rows: 4,
        fullWidth: true,
      },
      {
        key: 'biographyEn',
        label: 'Biography (English)',
        component: 'textarea',
        rows: 6,
        fullWidth: true,
      },
      {
        key: 'biographySw',
        label: 'Biography (Swahili)',
        component: 'textarea',
        rows: 6,
        fullWidth: true,
      },
      {
        component: 'section',
        label: 'Publishing',
        description: 'Set the workflow state for this commissioner profile.',
      },
      {
        key: 'publicationStatus',
        label: 'Status',
        component: 'select',
        options: STATUS_OPTIONS,
      },
    ],
    defaultForm: () => ({
      prefix: '',
      firstName: '',
      middleName: '',
      surname: '',
      designationKey: '',
      email: '',
      phoneNumber: '',
      profilePicture: null,
      gender: '',
      jobEn: '',
      jobSw: '',
      statementEn: '',
      statementSw: '',
      biographyEn: '',
      biographySw: '',
      publicationStatus: 'draft',
    }),
    mapRecordToForm(record = {}) {
      const job = toLocalizedParts(record?.job)
      const statement = toLocalizedParts(record?.statement)
      const biography = toLocalizedParts(record?.biography)
      return {
        prefix: record?.prefix || '',
        firstName: record?.firstName || '',
        middleName: record?.middleName || '',
        surname: record?.surname || '',
        designationKey: toDesignationKey(record?.designation),
        email: record?.email || '',
        phoneNumber: record?.phoneNumber || '',
        profilePicture: extractMediaFieldValue(
          record?.profilePicture || record?.image || record?.photo,
        ),
        gender: record?.gender || '',
        jobEn: job.en,
        jobSw: job.sw,
        statementEn: statement.en,
        statementSw: statement.sw,
        biographyEn: biography.en,
        biographySw: biography.sw,
        publicationStatus: record?.publicationStatus || 'draft',
      }
    },
    mapFormToPayload(form) {
      return {
        prefix: form.prefix || '',
        firstName: form.firstName,
        middleName: form.middleName,
        surname: form.surname,
        designation: buildDesignationValue(form.designationKey),
        email: form.email || '',
        phoneNumber: form.phoneNumber || '',
        profilePicture: buildMediaValue(form.profilePicture),
        gender: form.gender || null,
        job: buildLocalizedValue(form.jobEn, form.jobSw),
        statement: buildLocalizedValue(form.statementEn, form.statementSw),
        biography: buildLocalizedValue(form.biographyEn, form.biographySw),
        publicationStatus: form.publicationStatus || 'draft',
      }
    },
    adapter: {
      list: (query) => commissionersAPI.listCommissioners(query),
      find: (id) => commissionersAPI.findCommissioner({ commissionerId: id }),
      create: (payload) => commissionersAPI.createCommissioner(payload),
      update: (id, payload) =>
        commissionersAPI.updateCommissioner({ commissionerId: id, ...payload }),
      remove: (id) => commissionersAPI.deleteCommissioner({ commissionerId: id }),
      ...buildGenericWorkflowAdapter(commissionersAPI),
      mapItems: (response) => mapCollection(response, ['commissioners']),
      mapEntity: (response) => mapEntityByKey(response, 'commissioner'),
      getId: (record) => record?.commissionerId || record?._id || null,
    },
  },

  committees: {
    key: 'committees',
    label: 'Committees',
    singular: 'Committee',
    routeParam: 'committeeId',
    idKey: 'committeeId',
    routes: {
      list: 'committees.list',
      create: 'committees.create',
      details: 'committees.details',
      edit: 'committees.edit',
    },
    searchPlaceholder: 'Search committee by name',
    columns: [
      { key: 'committeeId', label: 'Committee ID', minWidth: 170 },
      { key: 'name', label: 'Name', minWidth: 220 },
      {
        key: 'members',
        label: 'Members',
        minWidth: 220,
        formatter: (row) =>
          Array.isArray(row?.members) && row.members.length
            ? row.members.map((member) => member?.name || member).join(', ')
            : '-',
      },
      { key: 'publicationStatus', label: 'Status', minWidth: 120 },
    ],
    detailFields: [
      { key: 'committeeId', label: 'Committee ID' },
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description' },
      {
        key: 'members',
        label: 'Members',
        formatter: (row) =>
          Array.isArray(row?.members) && row.members.length
            ? row.members.map((member) => member?.name || member).join(', ')
            : '-',
      },
      {
        key: 'functions',
        label: 'Functions',
        formatter: (row) =>
          Array.isArray(row?.functions) && row.functions.length
            ? row.functions.map((fn) => toLocalizedPreview(fn?.description || fn)).join(', ')
            : '-',
      },
      { key: 'publicationStatus', label: 'Status' },
    ],
    formSchema: [
      { key: 'name', label: 'Name', required: true, component: 'input' },
      { key: 'description', label: 'Description', component: 'textarea' },
      {
        key: 'functions',
        label: 'Functions',
        component: 'repeatable-list',
        fullWidth: true,
        valueMode: 'primitive',
        addLabel: 'Add function',
        itemTitle: 'Function',
        itemDescription: 'List each committee function as a separate item.',
        itemSchema: [
          {
            key: 'value',
            label: 'Function',
            component: 'textarea',
            rows: 3,
            placeholder: 'Describe this committee function',
          },
        ],
      },
      {
        key: 'members',
        label: 'Members',
        component: 'repeatable-list',
        fullWidth: true,
        valueMode: 'primitive',
        addLabel: 'Add member',
        itemTitle: 'Member',
        itemDescription: 'List committee members one by one.',
        itemSchema: [
          {
            key: 'value',
            label: 'Member name',
            component: 'input',
            placeholder: 'Enter the member name',
          },
        ],
      },
      {
        key: 'publicationStatus',
        label: 'Status',
        component: 'select',
        options: STATUS_OPTIONS,
      },
    ],
    defaultForm: () => ({
      name: '',
      description: '',
      functions: [],
      members: [],
      publicationStatus: 'draft',
    }),
    mapRecordToForm(record = {}) {
      return {
        name: record?.name || '',
        description: record?.description || '',
        functions: Array.isArray(record?.functions)
          ? record.functions.map((fn) => fn?.description || fn)
          : [],
        members: Array.isArray(record?.members)
          ? record.members.map((member) => member?.name || member)
          : [],
        publicationStatus: record?.publicationStatus || 'draft',
      }
    },
    mapFormToPayload(form) {
      return {
        name: form.name,
        description: form.description || '',
        functions: Array.isArray(form.functions)
          ? form.functions.map((item) => String(item || '').trim()).filter(Boolean)
          : [],
        members: Array.isArray(form.members)
          ? form.members.map((item) => String(item || '').trim()).filter(Boolean)
          : [],
        publicationStatus: form.publicationStatus || 'draft',
      }
    },
    adapter: {
      list: (query) => committeesAPI.listCommittees(query),
      find: (id) => committeesAPI.findCommittee({ committeeId: id }),
      create: (payload) => committeesAPI.createCommittee(payload),
      update: (id, payload) => committeesAPI.updateCommittee({ committeeId: id, ...payload }),
      remove: (id) => committeesAPI.deleteCommittee({ committeeId: id }),
      mapItems: (response) => mapCollection(response, ['committees']),
      mapEntity: (response) => mapEntityByKey(response, 'committee'),
      getId: (record) => record?.committeeId || record?._id || null,
    },
  },

  services: {
    key: 'services',
    label: 'Services',
    singular: 'Service',
    overview: {
      description:
        'Manage services with human-readable structural relationships and clear workflow visibility for administrators.',
    },
    wizard: {
      enabled: true,
    },
    routeParam: 'serviceId',
    idKey: 'serviceId',
    routes: {
      list: 'services.list',
      create: 'services.create',
      details: 'services.details',
      edit: 'services.edit',
    },
    searchPlaceholder: 'Search service by title',
    columns: [
      { key: 'serviceId', label: 'Service ID', minWidth: 170 },
      { key: 'title', label: 'Title', minWidth: 220 },
      {
        key: 'directorateId',
        label: 'Directorate',
        minWidth: 170,
        formatter: (row) =>
          row?.directorate?.name?.en || row?.directorate?.name || row?.directorateId || '-',
      },
      {
        key: 'sectionId',
        label: 'Section',
        minWidth: 170,
        formatter: (row) => row?.section?.name?.en || row?.section?.name || row?.sectionId || '-',
      },
      {
        key: 'unitId',
        label: 'Unit',
        minWidth: 170,
        formatter: (row) => row?.unit?.name?.en || row?.unit?.name || row?.unitId || '-',
      },
      { key: 'publicationStatus', label: 'Status', minWidth: 120 },
    ],
    detailFields: [
      { key: 'serviceId', label: 'Service ID' },
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description' },
      {
        key: 'directorateId',
        label: 'Directorate',
        formatter: (row) =>
          row?.directorate?.name?.en || row?.directorate?.name || row?.directorateId || '-',
      },
      {
        key: 'sectionId',
        label: 'Section',
        formatter: (row) => row?.section?.name?.en || row?.section?.name || row?.sectionId || '-',
      },
      {
        key: 'unitId',
        label: 'Unit',
        formatter: (row) => row?.unit?.name?.en || row?.unit?.name || row?.unitId || '-',
      },
      { key: 'publicationStatus', label: 'Status' },
    ],
    formSchema: [
      {
        component: 'section',
        label: 'Service Basics',
        description: 'Define the service title and its public-facing description.',
      },
      { key: 'title', label: 'Title', required: true, component: 'input' },
      { key: 'description', label: 'Description', component: 'textarea' },
      {
        component: 'section',
        label: 'Relationships',
        description: 'Link the service to the owning directorate, section, and unit by name.',
      },
      {
        key: 'directorateId',
        label: 'Directorate',
        required: true,
        component: 'entity-select',
        placeholder: 'Select directorate',
        loadOptions: loadDirectorateOptions,
      },
      {
        key: 'sectionId',
        label: 'Section',
        required: true,
        component: 'entity-select',
        placeholder: 'Select section',
        loadOptions: loadSectionOptions,
      },
      {
        key: 'unitId',
        label: 'Unit',
        component: 'entity-select',
        placeholder: 'Select unit',
        loadOptions: loadUnitOptions,
      },
      {
        component: 'section',
        label: 'Publishing',
        description: 'Set the workflow state for this service record.',
      },
      {
        key: 'publicationStatus',
        label: 'Status',
        component: 'select',
        options: STATUS_OPTIONS,
      },
    ],
    defaultForm: () => ({
      title: '',
      description: '',
      directorateId: '',
      sectionId: '',
      unitId: '',
      publicationStatus: 'draft',
    }),
    mapRecordToForm(record = {}) {
      return {
        title: record?.title || '',
        description: record?.description || '',
        directorateId:
          record?.directorate?._id ||
          record?.directorate?.directorateId ||
          record?.directorateId ||
          '',
        sectionId: record?.section?._id || record?.section?.sectionId || record?.sectionId || '',
        unitId: record?.unit?._id || record?.unit?.unitId || record?.unitId || '',
        publicationStatus: record?.publicationStatus || 'draft',
      }
    },
    mapFormToPayload(form) {
      return {
        title: form.title,
        description: form.description || '',
        directorateId: form.directorateId,
        sectionId: form.sectionId,
        unitId: form.unitId || null,
        publicationStatus: form.publicationStatus || 'draft',
      }
    },
    adapter: {
      list: (query) => servicesAPI.listServices(query),
      find: (id) => servicesAPI.findService({ serviceId: id }),
      create: (payload) => servicesAPI.createService(payload),
      update: (id, payload) => servicesAPI.updateService({ serviceId: id, ...payload }),
      remove: (id) => servicesAPI.deleteService({ serviceId: id }),
      ...buildGenericWorkflowAdapter(servicesAPI),
      mapItems: (response) => mapCollection(response, ['services']),
      mapEntity: (response) => mapEntityByKey(response, 'service'),
      getId: (record) => record?.serviceId || record?._id || null,
    },
  },

  questions: {
    key: 'questions',
    label: 'FAQs',
    singular: 'FAQ',
    routeParam: 'questionId',
    idKey: 'questionId',
    routes: {
      list: 'questions.list',
      create: 'questions.create',
      details: 'questions.details',
      edit: 'questions.edit',
    },
    searchPlaceholder: 'Search FAQ by question text',
    columns: [
      { key: 'questionId', label: 'Question ID', minWidth: 170 },
      {
        key: 'question',
        label: 'Question (EN)',
        minWidth: 260,
        formatter: (row) => toLocalizedPreviewText(row?.question),
      },
      { key: 'publicationStatus', label: 'Status', minWidth: 120 },
    ],
    detailFields: [
      { key: 'questionId', label: 'Question ID' },
      {
        key: 'question',
        label: 'Question (English)',
        formatter: (row) => toLocalizedObject(row?.question).en || '-',
      },
      {
        key: 'question',
        label: 'Question (Swahili)',
        formatter: (row) => toLocalizedObject(row?.question).sw || '-',
      },
      {
        key: 'answer',
        label: 'Answer (English)',
        formatter: (row) => toLocalizedObject(row?.answer).en || '-',
      },
      {
        key: 'answer',
        label: 'Answer (Swahili)',
        formatter: (row) => toLocalizedObject(row?.answer).sw || '-',
      },
      { key: 'publicationStatus', label: 'Status' },
    ],
    formSchema: [
      {
        component: 'section',
        label: 'Question',
        description: 'Capture the FAQ question exactly as it should appear in both languages.',
      },
      {
        key: 'questionEn',
        label: 'Question (English)',
        required: true,
        component: 'textarea',
      },
      {
        key: 'questionSw',
        label: 'Question (Swahili)',
        required: true,
        component: 'textarea',
      },
      {
        component: 'section',
        label: 'Answer',
        description:
          'Write the approved answer in both languages so editors can review and publish it.',
      },
      {
        key: 'answerEn',
        label: 'Answer (English)',
        required: true,
        component: 'textarea',
        rows: 5,
      },
      {
        key: 'answerSw',
        label: 'Answer (Swahili)',
        required: true,
        component: 'textarea',
        rows: 5,
      },
      {
        key: 'publicationStatus',
        label: 'Status',
        component: 'select',
        options: STATUS_OPTIONS,
      },
    ],
    defaultForm: () => ({
      questionEn: '',
      questionSw: '',
      answerEn: '',
      answerSw: '',
      publicationStatus: 'draft',
    }),
    mapRecordToForm(record = {}) {
      const question = toLocalizedObject(record?.question)
      const answer = toLocalizedObject(record?.answer)

      return {
        questionEn: question.en || '',
        questionSw: question.sw || '',
        answerEn: answer.en || '',
        answerSw: answer.sw || '',
        publicationStatus: record?.publicationStatus || 'draft',
      }
    },
    mapFormToPayload(form) {
      return {
        question: {
          en: form.questionEn,
          sw: form.questionSw,
        },
        answer: {
          en: form.answerEn,
          sw: form.answerSw,
        },
        publicationStatus: form.publicationStatus || 'draft',
      }
    },
    adapter: {
      list: (query) => questionsAPI.listQuestions(query),
      find: (id) => questionsAPI.findQuestion({ questionId: id }),
      create: (payload) => questionsAPI.createQuestion(payload),
      update: (id, payload) => questionsAPI.updateQuestion({ questionId: id, ...payload }),
      remove: (id) => questionsAPI.deleteQuestion({ questionId: id }),
      ...buildGenericWorkflowAdapter(questionsAPI),
      mapItems: (response) => mapCollection(response, ['questions']),
      mapEntity: (response) => mapEntityByKey(response, 'question'),
      getId: (record) => record?.questionId || record?._id || null,
    },
  },

  socials: {
    key: 'socials',
    label: 'Social Accounts',
    singular: 'Social Account',
    routeParam: 'socialId',
    idKey: 'socialId',
    routes: {
      list: 'socials.list',
      create: 'socials.create',
      details: 'socials.details',
      edit: 'socials.edit',
    },
    searchPlaceholder: 'Search social account by name or URL',
    columns: [
      { key: 'socialId', label: 'Social ID', minWidth: 160 },
      { key: 'name', label: 'Name', minWidth: 220 },
      { key: 'url', label: 'URL', minWidth: 260 },
      { key: 'publicationStatus', label: 'Status', minWidth: 120 },
    ],
    detailFields: [
      { key: 'socialId', label: 'Social ID' },
      { key: 'name', label: 'Name' },
      { key: 'url', label: 'URL' },
      { key: 'icon', label: 'Icon' },
      { key: 'publicationStatus', label: 'Status' },
    ],
    formSchema: [
      { key: 'name', label: 'Name', required: true, component: 'input' },
      { key: 'url', label: 'URL', required: true, component: 'input', type: 'url' },
      { key: 'icon', label: 'Icon', component: 'input' },
      {
        key: 'publicationStatus',
        label: 'Status',
        component: 'select',
        options: STATUS_OPTIONS,
      },
    ],
    defaultForm: () => ({
      name: '',
      url: '',
      icon: '',
      publicationStatus: 'draft',
    }),
    mapRecordToForm(record = {}) {
      return {
        name: record?.name || '',
        url: record?.url || '',
        icon: record?.icon || '',
        publicationStatus: record?.publicationStatus || 'draft',
      }
    },
    mapFormToPayload(form) {
      return {
        name: form.name,
        url: form.url,
        icon: form.icon || '',
        publicationStatus: form.publicationStatus || 'draft',
      }
    },
    adapter: {
      list: (query) => socialsAPI.listSocials(query),
      find: (id) => socialsAPI.findSocial({ socialId: id }),
      create: (payload) => socialsAPI.createSocial(payload),
      update: (id, payload) => socialsAPI.updateSocial({ socialId: id, ...payload }),
      remove: (id) => socialsAPI.deleteSocial({ socialId: id }),
      mapItems: (response) => mapCollection(response, ['socials']),
      mapEntity: (response) => mapEntityByKey(response, 'social'),
      getId: (record) => record?.socialId || record?._id || null,
    },
  },

  videos: {
    key: 'videos',
    label: 'Videos',
    singular: 'Video',
    routeParam: 'videoId',
    idKey: 'videoId',
    routes: {
      list: 'videos.list',
      create: 'videos.create',
      details: 'videos.details',
      edit: 'videos.edit',
    },
    searchPlaceholder: 'Search videos by caption or YouTube link',
    columns: [
      { key: 'videoId', label: 'Video ID', minWidth: 160 },
      { key: 'caption', label: 'Caption', minWidth: 250 },
      { key: 'url', label: 'YouTube Link', minWidth: 250 },
      { key: 'status', label: 'Status', minWidth: 120 },
    ],
    detailFields: [
      { key: 'videoId', label: 'Video ID' },
      { key: 'caption', label: 'Caption' },
      { key: 'url', label: 'YouTube Link' },
      { key: 'status', label: 'Status' },
      {
        key: 'published',
        label: 'Published',
        formatter: (row) => (row?.published ? 'Yes' : 'No'),
      },
    ],
    formSchema: [
      {
        component: 'section',
        label: 'Video Source',
        description: 'Paste the YouTube link used as the source for this video item.',
      },
      {
        key: 'url',
        label: 'YouTube Link',
        required: true,
        component: 'input',
        type: 'url',
        placeholder: 'https://www.youtube.com/watch?v=...',
        helpText: 'Use a YouTube share link or watch page URL.',
      },
      {
        key: 'caption',
        label: 'Caption',
        required: true,
        component: 'textarea',
        helpText: 'Explain the clip clearly for editors and website visitors.',
      },
      {
        key: 'status',
        label: 'Status',
        component: 'select',
        options: STATUS_OPTIONS,
      },
    ],
    defaultForm: () => ({
      url: '',
      caption: '',
      status: 'draft',
    }),
    mapRecordToForm(record = {}) {
      return {
        url: record?.url || '',
        caption: record?.caption || '',
        status: record?.status || 'draft',
      }
    },
    mapFormToPayload(form) {
      return {
        url: form.url,
        caption: form.caption,
        status: form.status || 'draft',
      }
    },
    adapter: {
      list: (query) => videosAPI.listVideos(query),
      listPublished: (query) => videosAPI.listPublishedVideos(query),
      find: (id) => videosAPI.findVideo({ videoId: id }),
      create: (payload) => videosAPI.createVideo(payload),
      update: (id, payload) => videosAPI.updateVideo({ videoId: id, ...payload }),
      remove: (id) => videosAPI.deleteVideo({ videoId: id }),
      publish: (id) => videosAPI.publishVideo({ videoId: id }),
      unpublish: (id) => videosAPI.unpublishVideo({ videoId: id }),
      archive: (id, { reason } = {}) => videosAPI.archiveVideo({ videoId: id, reason }),
      restoreArchived: (id) => videosAPI.unarchiveVideo({ videoId: id }),
      mapItems: (response) => mapCollection(response, ['videos']),
      mapEntity: (response) => mapEntityByKey(response, 'video'),
      getId: (record) => record?.videoId || record?._id || null,
    },
  },
})

export function getResourceConfig(resourceKey) {
  return RESOURCE_CONFIGS[resourceKey] || null
}

export function resolveResourceViewConfig(routeName, routePageMeta = null) {
  const [moduleKeyRaw = '', stateKeyRaw = 'list'] = String(routeName || '').split('.')
  const moduleKey = moduleKeyRaw || 'resource'
  const stateKey = stateKeyRaw || 'list'
  const baseConfig = getResourceConfig(moduleKey) || buildFallbackConfig(moduleKey)
  const config = {
    ...buildFallbackConfig(moduleKey),
    ...baseConfig,
    routes: {
      ...buildFallbackConfig(moduleKey).routes,
      ...(baseConfig.routes || {}),
    },
  }

  return {
    moduleKey,
    stateKey,
    config,
    title: routePageMeta?.title || buildTitle(config, stateKey),
    description: routePageMeta?.description || buildDescription(config, stateKey),
  }
}
