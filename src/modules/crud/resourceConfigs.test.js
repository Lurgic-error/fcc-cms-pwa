import { describe, expect, it } from 'vitest'

import { getResourceConfig } from './resourceConfigs'

describe('publication category resource config', () => {
  it('normalizes and maps the system key in publication category payloads', () => {
    const config = getResourceConfig('publicationCategories')

    expect(config.formSchema.some((field) => field.key === 'systemKey')).toBe(true)

    const payload = config.mapFormToPayload({
      systemKey: ' Legal Frameworks ',
      nameEn: 'Legal Frameworks',
      nameSw: 'Mifumo ya Kisheria',
      descriptionEn: 'Framework documents',
      descriptionSw: 'Nyaraka za mfumo',
      validityType: 'permanent',
      validityDurationDays: '',
      tags: ['law', 'policy'],
      publicationStatus: 'draft',
    })

    expect(payload.systemKey).toBe('legal-frameworks')
    expect(payload.tags).toEqual(['law', 'policy'])
  })
})

describe('article resource config', () => {
  it('maps bulletin and feature fields into the unified article payload', () => {
    const config = getResourceConfig('articles')

    const payload = config.mapFormToPayload({
      titleEn: 'Latest Market Update',
      titleSw: 'Taarifa ya Soko',
      descriptionEn: 'English summary',
      descriptionSw: 'Muhtasari wa Kiswahili',
      bodyEn: 'English body',
      bodySw: 'Mwili wa makala',
      slug: 'latest-market-update',
      tagsText: 'market, update',
      publicationStatus: 'approved',
      isBulletin: true,
      featureRequested: true,
    })

    expect(payload.title.en).toBe('Latest Market Update')
    expect(payload.description.sw).toBe('Muhtasari wa Kiswahili')
    expect(payload.tags).toEqual(['market', 'update'])
    expect(payload.isBulletin).toBe(true)
    expect(payload.featureRequested).toBe(true)
  })
})

describe('faq resource config', () => {
  it('maps bilingual FAQ form fields into localized question and answer payloads', () => {
    const config = getResourceConfig('questions')

    const payload = config.mapFormToPayload({
      questionEn: 'How do I submit a complaint?',
      questionSw: 'Ninawezaje kuwasilisha malalamiko?',
      answerEn: 'Use the complaints form on the website.',
      answerSw: 'Tumia fomu ya malalamiko kwenye tovuti.',
      publicationStatus: 'approved',
    })

    expect(payload.question).toEqual({
      en: 'How do I submit a complaint?',
      sw: 'Ninawezaje kuwasilisha malalamiko?',
    })
    expect(payload.answer.sw).toBe('Tumia fomu ya malalamiko kwenye tovuti.')
    expect(payload.publicationStatus).toBe('approved')
  })
})

describe('event resource config', () => {
  it('maps the multistep event form into occurrences, schedule, and guest collections', () => {
    const config = getResourceConfig('events')

    const payload = config.mapFormToPayload({
      title: 'FCC Public Dialogue',
      description: 'A structured public engagement event.',
      coverImage: { url: 'https://example.com/event-cover.jpg' },
      eventType: 'conference',
      targetAudience: ['businesses', 'consumers'],
      tags: ['dialogue', 'competition'],
      occurrences: [
        {
          startDate: '2026-05-10',
          endDate: '2026-05-11',
          venueName: 'Mlimani Hall',
          venueLocation: 'Dodoma',
        },
      ],
      schedule: [
        {
          title: 'Opening Session',
          speaker: 'Director General',
          startTime: '09:00',
          endTime: '10:00',
          description: 'Opening remarks and overview.',
        },
      ],
      sponsors: [
        {
          name: 'FCC Partner Network',
          contribution: 'Event logistics',
          website: 'https://example.com',
        },
      ],
      guestOfHonors: [
        {
          name: 'Hon. Jane Doe',
          title: 'Minister',
          organization: 'Ministry of Industry',
          notes: 'Keynote guest',
        },
      ],
      specialGuests: [
        {
          name: 'Dr. John Smith',
          title: 'Economist',
          organization: 'FCC',
          notes: 'Panelist',
        },
      ],
      publicationStatus: 'draft',
      isFeatured: true,
    })

    expect(payload.occurrences).toHaveLength(1)
    expect(payload.occurrences[0].venue.name).toBe('Mlimani Hall')
    expect(payload.occurrences[0].schedule[0].startTime).toBe('2026-05-10T09:00:00')
    expect(payload.sponsors[0].name).toBe('FCC Partner Network')
    expect(payload.guestOfHonors[0].organization).toBe('Ministry of Industry')
    expect(payload.specialGuests[0].name).toBe('Dr. John Smith')
  })
})

describe('structural resource configs', () => {
  it('maps directorate bilingual content and director profile into nested payloads', () => {
    const config = getResourceConfig('directorates')

    const payload = config.mapFormToPayload({
      nameEn: 'Policy Directorate',
      nameSw: 'Kurugenzi ya Sera',
      code: 'POL',
      slug: 'policy-directorate',
      coverImage: { url: 'https://example.com/directorate.png' },
      descriptionEn: 'Leads policy work',
      descriptionSw: 'Inaongoza kazi za sera',
      functionalities: [
        { en: 'Competition policy', sw: 'Sera ya ushindani' },
        { en: 'Market studies', sw: 'Tafiti za soko' },
      ],
      ctaEn: 'Read our mandate',
      ctaSw: 'Soma wajibu wetu',
      sloganEn: 'Policy with purpose',
      sloganSw: 'Sera yenye mwelekeo',
      directorFirstName: 'Neema',
      directorSurname: 'Kileo',
      directorEmail: 'neema@example.com',
      directorJobEn: 'Director',
      directorJobSw: 'Mkurugenzi',
      directorStatementEn: 'We protect markets.',
      directorStatementSw: 'Tunailinda soko.',
      publicationStatus: 'draft',
    })

    expect(payload.name.en).toBe('Policy Directorate')
    expect(payload.functionalities).toHaveLength(2)
    expect(payload.director.fullName).toBeUndefined()
    expect(payload.director.email).toBe('neema@example.com')
    expect(payload.directorStatement.en).toBe('We protect markets.')
    expect(payload.coverImage.url).toBe('https://example.com/directorate.png')
  })

  it('maps office address and contact groups into nested payloads', () => {
    const config = getResourceConfig('offices')

    const payload = config.mapFormToPayload({
      nameEn: 'Dodoma Office',
      nameSw: 'Ofisi ya Dodoma',
      code: 'DDM',
      slug: 'dodoma-office',
      type: 'office',
      descriptionEn: 'Regional office',
      descriptionSw: 'Ofisi ya kanda',
      functionalitiesEn: '',
      functionalitiesSw: '',
      ctaEn: '',
      ctaSw: '',
      sloganEn: '',
      sloganSw: '',
      managerFirstName: 'Asha',
      managerSurname: 'Mtema',
      managerJobEn: 'Regional Manager',
      managerJobSw: 'Meneja wa Kanda',
      region: 'Dodoma',
      district: 'Dodoma Urban',
      ward: 'Makole',
      street: 'Makole Road',
      building: 'FCC House',
      postalAddress: 'P.O. Box 2351',
      physicalAddress: 'Makole, Dodoma',
      phoneNumber: '+255262329087',
      fax: '+255262329099',
      email: 'dodoma@fcc.go.tz',
      publicationStatus: 'published',
    })

    expect(payload.address.region).toBe('Dodoma')
    expect(payload.address.building).toBe('FCC House')
    expect(payload.contacts.email).toBe('dodoma@fcc.go.tz')
    expect(payload.manager.job.en).toBe('Regional Manager')
  })

  it('maps commissioner controlled designation and biography fields', () => {
    const config = getResourceConfig('commissioners')

    const payload = config.mapFormToPayload({
      prefix: 'Hon.',
      firstName: 'Asha',
      middleName: '',
      surname: 'Mtema',
      designationKey: 'chairperson',
      email: 'asha@example.com',
      phoneNumber: '+255700000000',
      profilePicture: { url: 'https://example.com/asha.png' },
      gender: 'female',
      jobEn: 'Chairperson',
      jobSw: 'Mwenyekiti',
      statementEn: 'Competition matters.',
      statementSw: 'Ushindani ni muhimu.',
      biographyEn: 'Long-form biography',
      biographySw: 'Wasifu mrefu',
      publicationStatus: 'published',
    })

    expect(payload.designation.key).toBe('chairperson')
    expect(payload.profilePicture.url).toBe('https://example.com/asha.png')
    expect(payload.biography.sw).toBe('Wasifu mrefu')
  })

  it('maps photo edit forms into metadata and replacement image payloads', () => {
    const config = getResourceConfig('photos')

    const payload = config.mapFormToPayload({
      image: { name: 'replacement.jpg' },
      caption: 'Updated image caption',
      altText: 'Visitors at the FCC office',
      usageArea: 'media-center',
      placement: 'homepage gallery',
      credit: 'FCC archive',
      sortOrder: '3',
      tags: ['gallery', 'homepage'],
      status: 'published',
    })

    expect(payload.image).toEqual({ name: 'replacement.jpg' })
    expect(payload.tags).toEqual(['gallery', 'homepage'])
    expect(payload.sortOrder).toBe(3)
    expect(payload.status).toBe('published')
  })
})
