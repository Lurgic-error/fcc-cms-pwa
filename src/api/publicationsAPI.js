import { unwrapApiResponsePayload, wrapApiErrorResult } from './responseEnvelope'
import {
  createEditorialCollectionApi,
  parseEditorialApiError,
} from './editorialEntityApi'

export default function ({ request }) {
  const publicationsApi = createEditorialCollectionApi({
    request,
    baseUrl: '/publications',
    collectionKey: 'publications',
    searchPath: 'search',
    forceMultipart: true,
    processScheduledPath: 'process-scheduled',
  })

  const categoriesApi = createEditorialCollectionApi({
    request,
    baseUrl: '/publications/categories',
    collectionKey: 'categories',
    searchPath: 'search',
  })

  async function expirePublications() {
    try {
      const { data } = await request.post('/publications/maintenance/expire')
      return unwrapApiResponsePayload(data)
    } catch (error) {
      return wrapApiErrorResult(error, parseEditorialApiError)
    }
  }

  return Object.freeze({
    listPublications: publicationsApi.list,
    findPublication: ({ publicationId }) => publicationsApi.find(publicationId),
    listPublishedPublications: publicationsApi.listPublished,
    listArchivedPublications: publicationsApi.listArchived,
    searchPublications: publicationsApi.search,
    createPublication: ({ publicationInfo }) => publicationsApi.create(publicationInfo),
    createPublications: ({ items }) => publicationsApi.bulkCreate({ items }),
    updatePublication: ({ publicationId, ...publicationInfo }) =>
      publicationsApi.update(publicationId, publicationInfo),
    updatePublications: ({ items }) => publicationsApi.bulkUpdate({ items }),
    deletePublication: ({ publicationId }) => publicationsApi.remove(publicationId),
    deletePublications: ({ ids }) => publicationsApi.bulkRemove({ ids }),
    softDeletePublication: ({ publicationId, reason }) =>
      publicationsApi.softDelete(publicationId, reason),
    softDeletePublications: ({ ids, reason }) => publicationsApi.bulkSoftDelete({ ids, reason }),
    restorePublication: ({ publicationId }) => publicationsApi.restore(publicationId),
    restorePublications: ({ ids }) => publicationsApi.bulkRestore({ ids }),
    submitPublicationForApproval: ({ publicationId }) => publicationsApi.submit(publicationId),
    approvePublication: ({ publicationId }) => publicationsApi.approve(publicationId),
    rejectPublication: ({ publicationId, reason }) =>
      publicationsApi.reject(publicationId, reason),
    publishPublication: ({ publicationId }) => publicationsApi.publish(publicationId),
    unpublishPublication: ({ publicationId }) => publicationsApi.unpublish(publicationId),
    publishPublications: ({ ids }) => publicationsApi.bulkPublish({ ids }),
    unpublishPublications: ({ ids }) => publicationsApi.bulkUnpublish({ ids }),
    schedulePublicationPublish: ({ publicationId, scheduledPublishAt, timezone }) =>
      publicationsApi.schedulePublish(publicationId, { scheduledPublishAt, timezone }),
    schedulePublicationUnpublish: ({ publicationId, scheduledUnpublishAt, timezone }) =>
      publicationsApi.scheduleUnpublish(publicationId, { scheduledUnpublishAt, timezone }),
    cancelPublicationPublishSchedule: ({ publicationId }) =>
      publicationsApi.cancelPublishSchedule(publicationId),
    cancelPublicationUnpublishSchedule: ({ publicationId }) =>
      publicationsApi.cancelUnpublishSchedule(publicationId),
    schedulePublicationsPublish: ({ items }) => publicationsApi.bulkSchedulePublish({ items }),
    schedulePublicationsUnpublish: ({ items }) =>
      publicationsApi.bulkScheduleUnpublish({ items }),
    cancelPublicationsPublishSchedule: ({ ids }) =>
      publicationsApi.bulkCancelPublishSchedule({ ids }),
    cancelPublicationsUnpublishSchedule: ({ ids }) =>
      publicationsApi.bulkCancelUnpublishSchedule({ ids }),
    processScheduledPublications: publicationsApi.processScheduled,
    archivePublication: ({ publicationId, reason }) =>
      publicationsApi.archive(publicationId, reason),
    restoreArchivedPublication: ({ publicationId }) =>
      publicationsApi.restoreArchived(publicationId),
    archivePublications: ({ ids, reason }) => publicationsApi.bulkArchive({ ids, reason }),
    restoreArchivedPublications: ({ ids }) => publicationsApi.bulkRestoreArchived({ ids }),
    expirePublications,

    listPublicationCategories: categoriesApi.list,
    findPublicationCategory: ({ categoryId }) => categoriesApi.find(categoryId),
    listPublishedCategories: categoriesApi.listPublished,
    listArchivedCategories: categoriesApi.listArchived,
    searchCategories: categoriesApi.search,
    createPublicationCategory: (categoryInfo) => categoriesApi.create(categoryInfo),
    updatePublicationCategory: ({ categoryId, ...categoryInfo }) =>
      categoriesApi.update(categoryId, categoryInfo),
    deletePublicationCategory: ({ categoryId }) => categoriesApi.remove(categoryId),
    deletePublicationCategories: ({ ids }) => categoriesApi.bulkRemove({ ids }),
    softDeleteCategory: ({ categoryId, reason }) => categoriesApi.softDelete(categoryId, reason),
    softDeleteCategories: ({ ids, reason }) => categoriesApi.bulkSoftDelete({ ids, reason }),
    restoreCategory: ({ categoryId }) => categoriesApi.restore(categoryId),
    restoreCategories: ({ ids }) => categoriesApi.bulkRestore({ ids }),
    submitPublicationCategoryForApproval: ({ categoryId }) => categoriesApi.submit(categoryId),
    approvePublicationCategory: ({ categoryId }) => categoriesApi.approve(categoryId),
    rejectPublicationCategory: ({ categoryId, reason }) => categoriesApi.reject(categoryId, reason),
    publishCategory: ({ categoryId }) => categoriesApi.publish(categoryId),
    unpublishCategory: ({ categoryId }) => categoriesApi.unpublish(categoryId),
    publishCategories: ({ ids }) => categoriesApi.bulkPublish({ ids }),
    unpublishCategories: ({ ids }) => categoriesApi.bulkUnpublish({ ids }),
    schedulePublicationCategoryPublish: ({ categoryId, scheduledPublishAt, timezone }) =>
      categoriesApi.schedulePublish(categoryId, { scheduledPublishAt, timezone }),
    schedulePublicationCategoryUnpublish: ({ categoryId, scheduledUnpublishAt, timezone }) =>
      categoriesApi.scheduleUnpublish(categoryId, { scheduledUnpublishAt, timezone }),
    cancelPublicationCategoryPublishSchedule: ({ categoryId }) =>
      categoriesApi.cancelPublishSchedule(categoryId),
    cancelPublicationCategoryUnpublishSchedule: ({ categoryId }) =>
      categoriesApi.cancelUnpublishSchedule(categoryId),
    schedulePublicationCategoriesPublish: ({ items }) => categoriesApi.bulkSchedulePublish({ items }),
    schedulePublicationCategoriesUnpublish: ({ items }) =>
      categoriesApi.bulkScheduleUnpublish({ items }),
    cancelPublicationCategoriesPublishSchedule: ({ ids }) =>
      categoriesApi.bulkCancelPublishSchedule({ ids }),
    cancelPublicationCategoriesUnpublishSchedule: ({ ids }) =>
      categoriesApi.bulkCancelUnpublishSchedule({ ids }),
    archiveCategory: ({ categoryId, reason }) => categoriesApi.archive(categoryId, reason),
    archiveCategories: ({ ids, reason }) => categoriesApi.bulkArchive({ ids, reason }),
    restoreArchivedCategory: ({ categoryId }) => categoriesApi.restoreArchived(categoryId),
    restoreArchivedCategories: ({ ids }) => categoriesApi.bulkRestoreArchived({ ids }),
    publishPublicationCategory: ({ categoryId }) => categoriesApi.publish(categoryId),
  })
}
