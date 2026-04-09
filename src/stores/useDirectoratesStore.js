import { directoratesAPI } from '@/api'
import { defineStore } from 'pinia'
import { createWorkflowEntityStore } from './_shared/createWorkflowEntityStore'

const adapterApi = {
  list: (query) => directoratesAPI.listDirectorates(query),
  find: (id) => directoratesAPI.findDirectorate({ directorateId: id }),
  create: (payload) => directoratesAPI.createDirectorate(payload),
  update: (id, payload) => directoratesAPI.updateDirectorate({ directorateId: id, ...payload }),
  remove: (id) => directoratesAPI.deleteDirectorate({ directorateId: id }),
  listPublished: (query) => directoratesAPI.listPublishedDirectorates(query),
  listArchived: (query) => directoratesAPI.listArchivedDirectorates(query),
  softDelete: (id, reason) => directoratesAPI.softDelete(id, reason),
  restore: (id) => directoratesAPI.restore(id),
  submit: (id) => directoratesAPI.submit(id),
  approve: (id) => directoratesAPI.approve(id),
  reject: (id, reason) => directoratesAPI.reject(id, reason),
  publish: (id) => directoratesAPI.publish(id),
  unpublish: (id) => directoratesAPI.unpublish(id),
  archive: (id, reason) => directoratesAPI.archive(id, reason),
  restoreArchived: (id) => directoratesAPI.restoreArchived(id),
}

export const useDirectoratesStore = defineStore('directorates', () => {
  return createWorkflowEntityStore({
    api: adapterApi,
    idField: 'directorateId',
    entityKey: 'directorate',
    collectionKeys: ['directorates'],
    detailsRouteName: 'directorates.details',
  })
})
