import { sectionsAPI } from '@/api'
import { defineStore } from 'pinia'
import { createWorkflowEntityStore } from './_shared/createWorkflowEntityStore'

const adapterApi = {
  list: (query) => sectionsAPI.listSections(query),
  find: (id) => sectionsAPI.findSection({ sectionId: id }),
  create: (payload) => sectionsAPI.createSection(payload),
  update: (id, payload) => sectionsAPI.updateSection({ sectionId: id, ...payload }),
  remove: (id) => sectionsAPI.deleteSection({ sectionId: id }),
  listPublished: (query) => sectionsAPI.listPublishedSections(query),
  listArchived: (query) => sectionsAPI.listArchivedSections(query),
  softDelete: (id, reason) => sectionsAPI.softDelete(id, reason),
  restore: (id) => sectionsAPI.restore(id),
  submit: (id) => sectionsAPI.submit(id),
  approve: (id) => sectionsAPI.approve(id),
  reject: (id, reason) => sectionsAPI.reject(id, reason),
  publish: (id) => sectionsAPI.publish(id),
  unpublish: (id) => sectionsAPI.unpublish(id),
  archive: (id, reason) => sectionsAPI.archive(id, reason),
  restoreArchived: (id) => sectionsAPI.restoreArchived(id),
}

export const useSectionsStore = defineStore('sections', () => {
  return createWorkflowEntityStore({
    api: adapterApi,
    idField: 'sectionId',
    entityKey: 'section',
    collectionKeys: ['sections'],
    detailsRouteName: 'sections.details',
  })
})
