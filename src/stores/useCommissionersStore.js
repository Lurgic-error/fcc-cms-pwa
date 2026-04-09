import { commissionersAPI } from '@/api'
import { defineStore } from 'pinia'
import { createWorkflowEntityStore } from './_shared/createWorkflowEntityStore'

const adapterApi = {
  list: (query) => commissionersAPI.listCommissioners(query),
  find: (id) => commissionersAPI.findCommissioner({ commissionerId: id }),
  create: (payload) => commissionersAPI.createCommissioner(payload),
  update: (id, payload) => commissionersAPI.updateCommissioner({ commissionerId: id, ...payload }),
  remove: (id) => commissionersAPI.deleteCommissioner({ commissionerId: id }),
  listPublished: (query) => commissionersAPI.listPublishedCommissioners(query),
  listArchived: (query) => commissionersAPI.listArchived(query),
  softDelete: (id, reason) => commissionersAPI.softDelete(id, reason),
  restore: (id) => commissionersAPI.restore(id),
  submit: (id) => commissionersAPI.submit(id),
  approve: (id) => commissionersAPI.approve(id),
  reject: (id, reason) => commissionersAPI.reject(id, reason),
  publish: (id) => commissionersAPI.publish(id),
  unpublish: (id) => commissionersAPI.unpublish(id),
  archive: (id, reason) => commissionersAPI.archive(id, reason),
  restoreArchived: (id) => commissionersAPI.restoreArchived(id),
}

export const useCommissionersStore = defineStore('commissioners', () => {
  return createWorkflowEntityStore({
    api: adapterApi,
    idField: 'commissionerId',
    entityKey: 'commissioner',
    collectionKeys: ['commissioners'],
    detailsRouteName: 'commissioners.details',
  })
})
