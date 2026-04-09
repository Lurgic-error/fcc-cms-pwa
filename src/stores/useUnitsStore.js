import { unitsAPI } from '@/api'
import { defineStore } from 'pinia'
import { createWorkflowEntityStore } from './_shared/createWorkflowEntityStore'

const adapterApi = {
  list: (query) => unitsAPI.listUnits(query),
  find: (id) => unitsAPI.findUnit({ unitId: id }),
  create: (payload) => unitsAPI.createUnit(payload),
  update: (id, payload) => unitsAPI.updateUnit({ unitId: id, ...payload }),
  remove: (id) => unitsAPI.deleteUnit({ unitId: id }),
  listPublished: (query) => unitsAPI.listPublishedUnits(query),
  listArchived: (query) => unitsAPI.listArchivedUnits(query),
  softDelete: (id, reason) => unitsAPI.softDelete(id, reason),
  restore: (id) => unitsAPI.restore(id),
  submit: (id) => unitsAPI.submit(id),
  approve: (id) => unitsAPI.approve(id),
  reject: (id, reason) => unitsAPI.reject(id, reason),
  publish: (id) => unitsAPI.publish(id),
  unpublish: (id) => unitsAPI.unpublish(id),
  archive: (id, reason) => unitsAPI.archive(id, reason),
  restoreArchived: (id) => unitsAPI.restoreArchived(id),
}

export const useUnitsStore = defineStore('units', () => {
  return createWorkflowEntityStore({
    api: adapterApi,
    idField: 'unitId',
    entityKey: 'unit',
    collectionKeys: ['units'],
    detailsRouteName: 'units.details',
  })
})
