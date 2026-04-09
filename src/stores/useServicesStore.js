import { servicesAPI } from '@/api'
import { defineStore } from 'pinia'
import { createWorkflowEntityStore } from './_shared/createWorkflowEntityStore'

const adapterApi = {
  list: (query) => servicesAPI.listServices(query),
  find: (id) => servicesAPI.findService({ serviceId: id }),
  create: (payload) => servicesAPI.createService(payload),
  update: (id, payload) => servicesAPI.updateService({ serviceId: id, ...payload }),
  remove: (id) => servicesAPI.deleteService({ serviceId: id }),
  listPublished: (query) => servicesAPI.listPublishedServices(query),
  listArchived: (query) => servicesAPI.listArchivedServices(query),
  softDelete: (id, reason) => servicesAPI.softDelete(id, reason),
  restore: (id) => servicesAPI.restore(id),
  submit: (id) => servicesAPI.submit(id),
  approve: (id) => servicesAPI.approve(id),
  reject: (id, reason) => servicesAPI.reject(id, reason),
  publish: (id) => servicesAPI.publish(id),
  unpublish: (id) => servicesAPI.unpublish(id),
  archive: (id, reason) => servicesAPI.archive(id, reason),
  restoreArchived: (id) => servicesAPI.restoreArchived(id),
}

export const useServicesStore = defineStore('services', () => {
  return createWorkflowEntityStore({
    api: adapterApi,
    idField: 'serviceId',
    entityKey: 'service',
    collectionKeys: ['services'],
    detailsRouteName: 'services.details',
  })
})
