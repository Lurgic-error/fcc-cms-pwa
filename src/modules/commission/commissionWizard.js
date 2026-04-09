import {
  buildLocalizedValue,
  buildMediaValue,
  extractMediaFieldValue,
  extractPersonForm,
  toLocalizedParts,
} from '@/modules/crud/structuralContentForms'

function cleanString(value) {
  if (value == null) return ''
  return String(value).trim()
}

function hasValue(value) {
  if (value == null) return false
  if (typeof value === 'string') return Boolean(cleanString(value))
  if (Array.isArray(value)) return value.some(hasValue)
  if (typeof value === 'object') return Object.values(value).some(hasValue)
  return Boolean(value)
}

function createLocalizedField(initialValue = null) {
  const localized = toLocalizedParts(initialValue)
  return {
    en: localized.en,
    sw: localized.sw,
  }
}

function createLocalizedListItem(initialValue = null) {
  const localized = toLocalizedParts(initialValue)
  return {
    en: localized.en,
    sw: localized.sw,
  }
}

function createGalleryImage(initialValue = null) {
  return {
    image: extractMediaFieldValue(initialValue),
  }
}

function createCoreFunction(initialValue = {}) {
  return {
    coreFunctionId: cleanString(initialValue?.coreFunctionId),
    name: createLocalizedField(initialValue?.name),
    description: createLocalizedField(initialValue?.description),
    coverImage: extractMediaFieldValue(initialValue?.coverImage),
  }
}

function createPhilosophy(initialValue = {}) {
  return {
    philosophyId: cleanString(initialValue?.philosophyId),
    title: createLocalizedField(initialValue?.title || initialValue?.name || initialValue?.label),
    description: createLocalizedField(
      initialValue?.description || initialValue?.content || initialValue?.statement,
    ),
  }
}

function createMandate(initialValue = null) {
  if (
    initialValue &&
    typeof initialValue === 'object' &&
    !Array.isArray(initialValue) &&
    (initialValue.description || Array.isArray(initialValue.mandates))
  ) {
    return {
      description: createLocalizedField(initialValue.description),
      items:
        Array.isArray(initialValue.mandates) && initialValue.mandates.length
          ? initialValue.mandates.map((item) => createLocalizedListItem(item))
          : [createLocalizedListItem()],
    }
  }

  return {
    description: createLocalizedField(initialValue),
    items: [createLocalizedListItem()],
  }
}

function createDirectorGeneral(initialValue = {}) {
  const person = extractPersonForm(initialValue, 'directorGeneral')

  return {
    prefix: cleanString(person.directorGeneralPrefix),
    firstName: cleanString(person.directorGeneralFirstName),
    middleName: cleanString(person.directorGeneralMiddleName),
    surname: cleanString(person.directorGeneralSurname),
    email: cleanString(person.directorGeneralEmail),
    phoneNumber: cleanString(person.directorGeneralPhoneNumber),
    profilePicture: extractMediaFieldValue(person.directorGeneralProfilePicture),
    job: {
      en: cleanString(person.directorGeneralJobEn),
      sw: cleanString(person.directorGeneralJobSw),
    },
    statement: {
      en: cleanString(person.directorGeneralStatementEn),
      sw: cleanString(person.directorGeneralStatementSw),
    },
    biography: {
      en: cleanString(person.directorGeneralBiographyEn),
      sw: cleanString(person.directorGeneralBiographySw),
    },
  }
}

function createCommissionFunction(initialValue = null) {
  return createLocalizedListItem(initialValue)
}

export function createCommissionWizardForm() {
  return {
    name: createLocalizedField(),
    introduction: createLocalizedField(),
    outro: createLocalizedField(),
    welcomeNote: createLocalizedField(),
    history: createLocalizedField(),
    mandate: createMandate(),
    slogan: createLocalizedField(),
    cta: createLocalizedField(),
    commissionerStatement: createLocalizedField(),
    dgStatement: createLocalizedField(),
    coverImage: null,
    galleryImages: [createGalleryImage()],
    organizationStructure: {
      title: createLocalizedField(),
      description: createLocalizedField(),
      imageAlt: createLocalizedField(),
      image: null,
    },
    commissionFunctions: [createCommissionFunction()],
    directorGeneral: createDirectorGeneral(),
    coreFunctions: [createCoreFunction()],
    philosophies: [createPhilosophy()],
  }
}

function normalizeGalleryImages(images = []) {
  const mapped = Array.isArray(images)
    ? images.map((image) => createGalleryImage(image)).filter((image) => hasValue(image.image))
    : []

  return mapped.length ? mapped : [createGalleryImage()]
}

function normalizeCommissionFunctions(items = []) {
  const mapped = Array.isArray(items)
    ? items.map((item) => createCommissionFunction(item)).filter((item) => hasValue(item))
    : []

  return mapped.length ? mapped : [createCommissionFunction()]
}

function normalizeCoreFunctions(items = []) {
  const mapped = Array.isArray(items)
    ? items.map((item) => createCoreFunction(item)).filter((item) => hasValue(item))
    : []

  return mapped.length ? mapped : [createCoreFunction()]
}

function normalizePhilosophies(items = []) {
  const mapped = Array.isArray(items)
    ? items.map((item) => createPhilosophy(item)).filter((item) => hasValue(item))
    : []

  return mapped.length ? mapped : [createPhilosophy()]
}

export function mapCommissionToWizardForm(record = {}) {
  return {
    name: createLocalizedField(record?.name),
    introduction: createLocalizedField(record?.introduction),
    outro: createLocalizedField(record?.outro),
    welcomeNote: createLocalizedField(record?.welcomeNote),
    history: createLocalizedField(record?.history),
    mandate: createMandate(record?.mandate),
    slogan: createLocalizedField(record?.slogan),
    cta: createLocalizedField(record?.cta),
    commissionerStatement: createLocalizedField(
      record?.commissionerStatement || record?.chairmanStatement,
    ),
    dgStatement: createLocalizedField(record?.dgStatement),
    coverImage: extractMediaFieldValue(record?.coverImage),
    galleryImages: normalizeGalleryImages(record?.images),
    organizationStructure: {
      title: createLocalizedField(record?.organizationStructure?.title),
      description: createLocalizedField(record?.organizationStructure?.description),
      imageAlt: createLocalizedField(record?.organizationStructure?.imageAlt),
      image: extractMediaFieldValue(
        record?.organizationStructure?.image || record?.organizationStructure,
      ),
    },
    commissionFunctions: normalizeCommissionFunctions(record?.commissionFunctions),
    directorGeneral: createDirectorGeneral(record?.directorGeneral || {}),
    coreFunctions: normalizeCoreFunctions(record?.coreFunctions),
    philosophies: normalizePhilosophies(record?.philosophies),
  }
}

function buildLocalizedListFromItems(items = []) {
  return items.map((item) => buildLocalizedValue(item?.en, item?.sw)).filter(Boolean)
}

function buildGalleryImages(items = []) {
  return items.map((item) => buildMediaValue(item?.image)).filter(Boolean)
}

function buildDirectorGeneralPayload(directorGeneral = {}) {
  const payload = {
    prefix: cleanString(directorGeneral.prefix) || null,
    firstName: cleanString(directorGeneral.firstName) || null,
    middleName: cleanString(directorGeneral.middleName) || null,
    surname: cleanString(directorGeneral.surname) || null,
    email: cleanString(directorGeneral.email) || null,
    phoneNumber: cleanString(directorGeneral.phoneNumber) || null,
    profilePicture: buildMediaValue(directorGeneral.profilePicture),
    job: buildLocalizedValue(directorGeneral?.job?.en, directorGeneral?.job?.sw),
    statement: buildLocalizedValue(directorGeneral?.statement?.en, directorGeneral?.statement?.sw),
    biography: buildLocalizedValue(directorGeneral?.biography?.en, directorGeneral?.biography?.sw),
  }

  return Object.values(payload).some(hasValue) ? payload : null
}

export function buildCommissionWizardPayload(form = createCommissionWizardForm()) {
  return {
    name: buildLocalizedValue(form?.name?.en, form?.name?.sw),
    introduction: buildLocalizedValue(form?.introduction?.en, form?.introduction?.sw),
    outro: buildLocalizedValue(form?.outro?.en, form?.outro?.sw),
    welcomeNote: buildLocalizedValue(form?.welcomeNote?.en, form?.welcomeNote?.sw),
    history: buildLocalizedValue(form?.history?.en, form?.history?.sw),
    mandate: {
      description: buildLocalizedValue(
        form?.mandate?.description?.en,
        form?.mandate?.description?.sw,
      ),
      mandates: buildLocalizedListFromItems(form?.mandate?.items),
    },
    slogan: buildLocalizedValue(form?.slogan?.en, form?.slogan?.sw),
    cta: buildLocalizedValue(form?.cta?.en, form?.cta?.sw),
    commissionerStatement: buildLocalizedValue(
      form?.commissionerStatement?.en,
      form?.commissionerStatement?.sw,
    ),
    chairmanStatement: buildLocalizedValue(
      form?.commissionerStatement?.en,
      form?.commissionerStatement?.sw,
    ),
    dgStatement: buildLocalizedValue(form?.dgStatement?.en, form?.dgStatement?.sw),
    coverImage: buildMediaValue(form?.coverImage),
    images: buildGalleryImages(form?.galleryImages),
    organizationStructure: {
      title: buildLocalizedValue(
        form?.organizationStructure?.title?.en,
        form?.organizationStructure?.title?.sw,
      ),
      description: buildLocalizedValue(
        form?.organizationStructure?.description?.en,
        form?.organizationStructure?.description?.sw,
      ),
      imageAlt: buildLocalizedValue(
        form?.organizationStructure?.imageAlt?.en,
        form?.organizationStructure?.imageAlt?.sw,
      ),
      image: buildMediaValue(form?.organizationStructure?.image),
    },
    commissionFunctions: buildLocalizedListFromItems(form?.commissionFunctions),
    directorGeneral: buildDirectorGeneralPayload(form?.directorGeneral),
    coreFunctions: (form?.coreFunctions || [])
      .map((item) => ({
        ...(cleanString(item?.coreFunctionId)
          ? { coreFunctionId: cleanString(item.coreFunctionId) }
          : {}),
        name: buildLocalizedValue(item?.name?.en, item?.name?.sw),
        description: buildLocalizedValue(item?.description?.en, item?.description?.sw),
        coverImage: buildMediaValue(item?.coverImage),
      }))
      .filter(
        (item) => hasValue(item?.name) || hasValue(item?.description) || hasValue(item?.coverImage),
      ),
    philosophies: (form?.philosophies || [])
      .map((item) => ({
        ...(cleanString(item?.philosophyId)
          ? { philosophyId: cleanString(item.philosophyId) }
          : {}),
        title: buildLocalizedValue(item?.title?.en, item?.title?.sw),
        description: buildLocalizedValue(item?.description?.en, item?.description?.sw),
      }))
      .filter((item) => hasValue(item?.title) || hasValue(item?.description)),
  }
}

export const COMMISSION_WIZARD_STEPS = Object.freeze([
  {
    key: 'basicProfile',
    title: 'Basic Profile',
    description: 'Set the commission name, welcome note, featured statements, and media.',
    helper:
      'This step captures the top-level commission profile used across overview and landing pages.',
  },
  {
    key: 'introduction',
    title: 'Introduction',
    description: 'Write the bilingual introduction shown on the commission profile.',
    helper: 'Keep the introduction concise, institutional, and aligned in both languages.',
  },
  {
    key: 'history',
    title: 'History',
    description: 'Document the commission history in English and Swahili.',
    helper: 'Use this step for the organization timeline and historical context.',
  },
  {
    key: 'mandate',
    title: 'Mandate',
    description: 'Capture the bilingual mandate summary and repeatable mandate points.',
    helper: 'The public site expects a lead paragraph followed by mandate bullet points.',
  },
  {
    key: 'philosophies',
    title: 'Philosophies',
    description: 'Manage the commission principles shown as repeatable philosophy cards.',
    helper: 'Each philosophy should have a short title and supporting explanation.',
  },
  {
    key: 'coreFunctions',
    title: 'Core Functions',
    description: 'Manage the public core function cards with bilingual titles and descriptions.',
    helper: 'Attach a cover image per function when visual treatment is available.',
  },
  {
    key: 'organizationStructure',
    title: 'Organization Structure',
    description: 'Describe the organization structure and connect the supporting image.',
    helper: 'Provide clear bilingual image alt text to keep the structure accessible.',
  },
  {
    key: 'directorGeneral',
    title: 'Director General',
    description:
      'Maintain the Director General profile, statement, biography, and featured message.',
    helper: 'This step feeds DG profile cards, biography pages, and lead statements.',
  },
  {
    key: 'cta',
    title: 'Call To Action',
    description: 'Define the bilingual call-to-action content for commission landing surfaces.',
    helper: 'Keep the action language clear and free from slogan/history copy-paste.',
  },
  {
    key: 'slogan',
    title: 'Slogan',
    description: 'Set the short bilingual commission slogan.',
    helper: 'Use short, memorable text that works as a paired bilingual tagline.',
  },
  {
    key: 'outro',
    title: 'Outro',
    description: 'Close the commission narrative with a bilingual outro.',
    helper: 'Use this for the final call-out or closing institutional message.',
  },
  {
    key: 'review',
    title: 'Review & Finish',
    description: 'Review every section, confirm missing areas, and finish the wizard.',
    helper: 'You can jump back to any incomplete section before finishing.',
  },
])

function hasLocalizedTextPair(value) {
  return Boolean(cleanString(value?.en) && cleanString(value?.sw))
}

function hasRepeatableLocalizedItems(items = []) {
  return items.some((item) => hasLocalizedTextPair(item))
}

function hasCoreFunctionItems(items = []) {
  return items.some(
    (item) => hasLocalizedTextPair(item?.name) && hasLocalizedTextPair(item?.description),
  )
}

function hasPhilosophyItems(items = []) {
  return items.some(
    (item) => hasLocalizedTextPair(item?.title) && hasLocalizedTextPair(item?.description),
  )
}

function hasDirectorGeneralProfile(directorGeneral = {}) {
  return (
    Boolean(cleanString(directorGeneral.firstName) || cleanString(directorGeneral.surname)) &&
    hasLocalizedTextPair(directorGeneral.job) &&
    hasLocalizedTextPair(directorGeneral.statement)
  )
}

export function isCommissionWizardStepComplete(stepKey, form = createCommissionWizardForm()) {
  switch (stepKey) {
    case 'basicProfile':
      return (
        hasLocalizedTextPair(form?.name) &&
        hasLocalizedTextPair(form?.welcomeNote) &&
        hasLocalizedTextPair(form?.commissionerStatement)
      )
    case 'introduction':
      return hasLocalizedTextPair(form?.introduction)
    case 'history':
      return hasLocalizedTextPair(form?.history)
    case 'mandate':
      return (
        hasLocalizedTextPair(form?.mandate?.description) &&
        hasRepeatableLocalizedItems(form?.mandate?.items)
      )
    case 'philosophies':
      return hasPhilosophyItems(form?.philosophies)
    case 'coreFunctions':
      return hasCoreFunctionItems(form?.coreFunctions)
    case 'organizationStructure':
      return (
        hasLocalizedTextPair(form?.organizationStructure?.title) &&
        hasLocalizedTextPair(form?.organizationStructure?.description) &&
        hasValue(form?.organizationStructure?.image)
      )
    case 'directorGeneral':
      return (
        hasDirectorGeneralProfile(form?.directorGeneral) && hasLocalizedTextPair(form?.dgStatement)
      )
    case 'cta':
      return hasLocalizedTextPair(form?.cta)
    case 'slogan':
      return hasLocalizedTextPair(form?.slogan)
    case 'outro':
      return hasLocalizedTextPair(form?.outro)
    case 'review':
      return COMMISSION_WIZARD_STEPS.filter((step) => step.key !== 'review').every((step) =>
        isCommissionWizardStepComplete(step.key, form),
      )
    default:
      return false
  }
}

export function buildCommissionStepPayload(stepKey, form = createCommissionWizardForm()) {
  const payload = buildCommissionWizardPayload(form)

  switch (stepKey) {
    case 'basicProfile':
      return {
        name: payload.name,
        welcomeNote: payload.welcomeNote,
        coverImage: payload.coverImage,
        images: payload.images,
        commissionerStatement: payload.commissionerStatement,
        chairmanStatement: payload.chairmanStatement,
        commissionFunctions: payload.commissionFunctions,
      }
    case 'introduction':
      return { introduction: payload.introduction }
    case 'history':
      return { history: payload.history }
    case 'mandate':
      return { mandate: payload.mandate }
    case 'philosophies':
      return { philosophies: payload.philosophies }
    case 'coreFunctions':
      return { coreFunctions: payload.coreFunctions }
    case 'organizationStructure':
      return { organizationStructure: payload.organizationStructure }
    case 'directorGeneral':
      return {
        directorGeneral: payload.directorGeneral,
        dgStatement: payload.dgStatement,
      }
    case 'cta':
      return { cta: payload.cta }
    case 'slogan':
      return { slogan: payload.slogan }
    case 'outro':
      return { outro: payload.outro }
    case 'review':
      return payload
    default:
      return {}
  }
}

export function summarizeLocalized(value, fallback = 'Not provided') {
  const localized = toLocalizedParts(value)
  return localized.en || localized.sw || fallback
}

export function buildCommissionWizardReview(form = createCommissionWizardForm()) {
  return [
    {
      key: 'basicProfile',
      title: 'Basic Profile',
      summary: summarizeLocalized(form?.name),
      details: [
        `Welcome note: ${summarizeLocalized(form?.welcomeNote)}`,
        `Commissioner statement: ${summarizeLocalized(form?.commissionerStatement)}`,
        `Commission functions: ${(form?.commissionFunctions || []).filter(hasValue).length}`,
      ],
    },
    {
      key: 'introduction',
      title: 'Introduction',
      summary: summarizeLocalized(form?.introduction),
      details: [],
    },
    {
      key: 'history',
      title: 'History',
      summary: summarizeLocalized(form?.history),
      details: [],
    },
    {
      key: 'mandate',
      title: 'Mandate',
      summary: summarizeLocalized(form?.mandate?.description),
      details: [`Mandate items: ${(form?.mandate?.items || []).filter(hasValue).length}`],
    },
    {
      key: 'philosophies',
      title: 'Philosophies',
      summary: `${(form?.philosophies || []).filter(hasValue).length} philosophy entries`,
      details: [],
    },
    {
      key: 'coreFunctions',
      title: 'Core Functions',
      summary: `${(form?.coreFunctions || []).filter(hasValue).length} core function entries`,
      details: [],
    },
    {
      key: 'organizationStructure',
      title: 'Organization Structure',
      summary: summarizeLocalized(form?.organizationStructure?.title),
      details: [
        `Image: ${hasValue(form?.organizationStructure?.image) ? 'Ready' : 'Not provided'}`,
      ],
    },
    {
      key: 'directorGeneral',
      title: 'Director General',
      summary:
        [
          cleanString(form?.directorGeneral?.prefix),
          cleanString(form?.directorGeneral?.firstName),
          cleanString(form?.directorGeneral?.middleName),
          cleanString(form?.directorGeneral?.surname),
        ]
          .filter(Boolean)
          .join(' ') || 'Not provided',
      details: [`Featured DG message: ${summarizeLocalized(form?.dgStatement)}`],
    },
    {
      key: 'cta',
      title: 'Call To Action',
      summary: summarizeLocalized(form?.cta),
      details: [],
    },
    {
      key: 'slogan',
      title: 'Slogan',
      summary: summarizeLocalized(form?.slogan),
      details: [],
    },
    {
      key: 'outro',
      title: 'Outro',
      summary: summarizeLocalized(form?.outro),
      details: [],
    },
  ]
}

export function hasCommissionContent(record = {}) {
  return (
    hasValue(record?.name) || hasValue(record?.introduction) || hasValue(record?.directorGeneral)
  )
}
