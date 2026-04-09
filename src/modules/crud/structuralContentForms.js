export const COMMISSIONER_DESIGNATION_OPTIONS = Object.freeze([
  { label: 'Chairperson', value: 'chairperson' },
  { label: 'Commissioner', value: 'commissioner' },
  { label: 'Commissioner & Director General', value: 'commissioner_director_general' },
  { label: 'Secretary to the Commission', value: 'secretary_to_the_commission' },
])

const DESIGNATION_LABELS = Object.freeze({
  chairperson: { key: 'chairperson', en: 'Chairperson', sw: 'Mwenyekiti' },
  commissioner: { key: 'commissioner', en: 'Commissioner', sw: 'Mjumbe wa Tume' },
  commissioner_director_general: {
    key: 'commissioner_director_general',
    en: 'Commissioner & Director General',
    sw: 'Mjumbe wa Tume na Mkurugenzi Mkuu',
  },
  secretary_to_the_commission: {
    key: 'secretary_to_the_commission',
    en: 'Secretary to the Commission',
    sw: 'Katibu wa Tume',
  },
})

function cleanString(value) {
  if (value == null) return ''
  return String(value).trim()
}

export function toLocalizedParts(value) {
  if (!value) return { en: '', sw: '' }
  if (typeof value === 'string') {
    const text = cleanString(value)
    return { en: text, sw: text }
  }

  return {
    en: cleanString(
      value.en || value.english || value.titleEn || value.nameEn || value.descriptionEn,
    ),
    sw: cleanString(
      value.sw || value.swahili || value.titleSw || value.nameSw || value.descriptionSw,
    ),
  }
}

export function buildLocalizedValue(en, sw) {
  const localized = {
    en: cleanString(en),
    sw: cleanString(sw),
  }

  if (!localized.en && !localized.sw) return null
  if (!localized.en) localized.en = localized.sw
  if (!localized.sw) localized.sw = localized.en
  return localized
}

export function extractMediaUrl(asset) {
  if (!asset) return ''
  if (typeof asset === 'string') return cleanString(asset)
  return cleanString(asset.url || asset.path || asset.src)
}

export function extractMediaFieldValue(asset) {
  if (!asset) return null
  if (Array.isArray(asset)) return extractMediaFieldValue(asset[0] || null)
  if (typeof asset === 'string') {
    const normalizedUrl = cleanString(asset)
    return normalizedUrl ? { url: normalizedUrl } : null
  }

  return asset
}

export function buildMediaValue(value) {
  if (!value) return null
  if (Array.isArray(value)) return buildMediaValue(value[0] || null)
  if (value instanceof File) return value
  if (typeof value === 'object') {
    if (value.url || value.path || value.src) {
      return {
        ...(value.url ? { url: cleanString(value.url) } : {}),
        ...(value.path ? { path: cleanString(value.path) } : {}),
        ...(value.src ? { src: cleanString(value.src) } : {}),
        ...(value.filename ? { filename: cleanString(value.filename) } : {}),
        ...(value.originalname ? { originalname: cleanString(value.originalname) } : {}),
      }
    }

    return value
  }

  const normalizedUrl = cleanString(value)
  return normalizedUrl ? { url: normalizedUrl } : null
}

export function listToMultiline(list = [], locale = 'en') {
  if (!Array.isArray(list)) return ''
  return list
    .map((item) => {
      if (typeof item === 'string') return cleanString(item)
      if (typeof item === 'object') {
        const localized = toLocalizedParts(item.name || item.title || item.description || item)
        return locale === 'sw' ? localized.sw || localized.en : localized.en || localized.sw
      }
      return ''
    })
    .filter(Boolean)
    .join('\n')
}

export function buildLocalizedList(englishText, swahiliText) {
  const enLines = String(englishText || '')
    .split(/\r?\n/)
    .map((line) => cleanString(line))
    .filter(Boolean)
  const swLines = String(swahiliText || '')
    .split(/\r?\n/)
    .map((line) => cleanString(line))
    .filter(Boolean)

  const length = Math.max(enLines.length, swLines.length)
  return Array.from({ length }, (_, index) =>
    buildLocalizedValue(enLines[index], swLines[index]),
  ).filter(Boolean)
}

export function toDesignationKey(value) {
  if (!value) return ''
  if (typeof value === 'string') {
    return cleanString(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
  }

  return toDesignationKey(value.key || value.en || value.sw)
}

export function buildDesignationValue(key) {
  const normalizedKey = toDesignationKey(key)
  if (!normalizedKey) return null
  return (
    DESIGNATION_LABELS[normalizedKey] || {
      key: normalizedKey,
      en: normalizedKey.replace(/_/g, ' '),
      sw: normalizedKey.replace(/_/g, ' '),
    }
  )
}

export function extractPersonForm(person = {}, prefix = '') {
  const localizedJob = toLocalizedParts(person.job)
  const localizedStatement = toLocalizedParts(person.statement)
  const localizedBiography = toLocalizedParts(person.biography)
  const base = {
    [`${prefix}Prefix`]: cleanString(person.prefix),
    [`${prefix}FirstName`]: cleanString(person.firstName),
    [`${prefix}MiddleName`]: cleanString(person.middleName),
    [`${prefix}Surname`]: cleanString(person.surname || person.lastName),
    [`${prefix}Email`]: cleanString(person.email),
    [`${prefix}PhoneNumber`]: cleanString(person.phoneNumber || person.phone),
    [`${prefix}Gender`]: cleanString(person.gender),
    [`${prefix}ProfilePicture`]: extractMediaFieldValue(
      person.profilePicture || person.image || person.photo,
    ),
    [`${prefix}JobEn`]: localizedJob.en,
    [`${prefix}JobSw`]: localizedJob.sw,
    [`${prefix}StatementEn`]: localizedStatement.en,
    [`${prefix}StatementSw`]: localizedStatement.sw,
    [`${prefix}BiographyEn`]: localizedBiography.en,
    [`${prefix}BiographySw`]: localizedBiography.sw,
  }

  if (person.designation) {
    base[`${prefix}DesignationKey`] = toDesignationKey(person.designation)
  }

  return base
}

export function buildPersonPayload(form = {}, prefix = '', options = {}) {
  const designation = buildDesignationValue(
    form[`${prefix}DesignationKey`] || options.designationKey,
  )
  const payload = {
    prefix: cleanString(form[`${prefix}Prefix`]) || null,
    firstName: cleanString(form[`${prefix}FirstName`]) || null,
    middleName: cleanString(form[`${prefix}MiddleName`]) || null,
    surname: cleanString(form[`${prefix}Surname`]) || null,
    email: cleanString(form[`${prefix}Email`]) || null,
    phoneNumber: cleanString(form[`${prefix}PhoneNumber`]) || null,
    gender: cleanString(form[`${prefix}Gender`]) || null,
    profilePicture: buildMediaValue(
      form[`${prefix}ProfilePicture`] || form[`${prefix}ProfilePictureUrl`],
    ),
    job: buildLocalizedValue(form[`${prefix}JobEn`], form[`${prefix}JobSw`]),
    statement: buildLocalizedValue(form[`${prefix}StatementEn`], form[`${prefix}StatementSw`]),
    biography: buildLocalizedValue(form[`${prefix}BiographyEn`], form[`${prefix}BiographySw`]),
    designation,
  }

  const hasContent = Object.values(payload).some((value) => {
    if (!value) return false
    if (typeof value === 'object') return Object.values(value).some(Boolean)
    return Boolean(value)
  })

  return hasContent ? payload : null
}

export function extractAddressForm(record = {}) {
  const address = record.address || {}
  return {
    region: cleanString(address.region || record.region),
    district: cleanString(address.district || record.district),
    ward: cleanString(address.ward || record.ward),
    street: cleanString(address.street || record.street),
    building: cleanString(address.building || record.building),
    postalAddress: cleanString(address.postalAddress || record.postalAddress),
    physicalAddress: cleanString(address.physicalAddress || record.physicalAddress),
  }
}

export function buildAddressPayload(form = {}) {
  const payload = {
    region: cleanString(form.region) || null,
    district: cleanString(form.district) || null,
    ward: cleanString(form.ward) || null,
    street: cleanString(form.street) || null,
    building: cleanString(form.building) || null,
    postalAddress: cleanString(form.postalAddress) || null,
    physicalAddress: cleanString(form.physicalAddress) || null,
  }

  return Object.values(payload).some(Boolean) ? payload : null
}

export function extractContactsForm(record = {}) {
  const contacts = record.contacts || {}
  return {
    phoneNumber: cleanString(contacts.phoneNumber || record.phoneNumber),
    fax: cleanString(contacts.fax || record.fax),
    email: cleanString(contacts.email || record.email),
  }
}

export function buildContactsPayload(form = {}) {
  const payload = {
    phoneNumber: cleanString(form.phoneNumber) || null,
    fax: cleanString(form.fax) || null,
    email: cleanString(form.email) || null,
  }

  return Object.values(payload).some(Boolean) ? payload : null
}
