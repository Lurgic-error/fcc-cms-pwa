import { createEditorialCollectionApi, parseEditorialApiError } from './editorialEntityApi'

export default function ({ request }) {
  const api = createEditorialCollectionApi({
    request,
    baseUrl: '/articles',
    collectionKey: 'articles',
    extraListEndpoints: {
      findFeaturedArticles: 'featured',
      findFeatureRequestedArticles: 'feature-requests',
      findApprovedReadyForPublish: 'approved-ready',
    },
    processScheduledPath: 'process-scheduled',
  })

  async function unfeatureExpiredArticles() {
    try {
      const { data } = await request.post('/articles/maintenance/unfeature-expired')
      return data
    } catch (error) {
      return { error: parseEditorialApiError(error) }
    }
  }

  return Object.freeze({
    listArticles: api.list,
    findArticle: ({ articleId }) => api.find(articleId),
    listPublishedArticles: api.listPublished,
    listArchivedArticles: api.listArchived,
    findFeaturedArticles: api.findFeaturedArticles,
    findFeatureRequestedArticles: api.findFeatureRequestedArticles,
    findApprovedReadyForPublish: api.findApprovedReadyForPublish,

    createArticle: ({ articleInfo }) => api.create(articleInfo),
    createArticles: ({ items }) => api.bulkCreate({ items }),

    updateArticle: ({ articleId, ...articleInfo }) => api.update(articleId, articleInfo),
    updateArticles: ({ items }) => api.bulkUpdate({ items }),

    deleteArticle: ({ articleId }) => api.remove(articleId),
    deleteArticles: ({ ids }) => api.bulkRemove({ ids }),
    softDeleteArticle: ({ articleId, reason }) => api.softDelete(articleId, reason),
    softDeleteArticles: ({ ids, reason }) => api.bulkSoftDelete({ ids, reason }),

    restoreArticle: ({ articleId }) => api.restore(articleId),
    restoreArticles: ({ ids }) => api.bulkRestore({ ids }),

    submitArticleForApproval: ({ articleId }) => api.submit(articleId),
    approveArticle: ({ articleId }) => api.approve(articleId),
    rejectArticle: ({ articleId, reason }) => api.reject(articleId, reason),
    publishArticle: ({ articleId }) => api.publish(articleId),
    unpublishArticle: ({ articleId }) => api.unpublish(articleId),
    publishArticles: ({ ids }) => api.bulkPublish({ ids }),
    unpublishArticles: ({ ids }) => api.bulkUnpublish({ ids }),

    scheduleArticlePublish: ({ articleId, scheduledPublishAt, timezone }) =>
      api.schedulePublish(articleId, { scheduledPublishAt, timezone }),
    scheduleArticleUnpublish: ({ articleId, scheduledUnpublishAt, timezone }) =>
      api.scheduleUnpublish(articleId, { scheduledUnpublishAt, timezone }),
    cancelArticlePublishSchedule: ({ articleId }) => api.cancelPublishSchedule(articleId),
    cancelArticleUnpublishSchedule: ({ articleId }) => api.cancelUnpublishSchedule(articleId),
    scheduleArticlesPublish: ({ items }) => api.bulkSchedulePublish({ items }),
    scheduleArticlesUnpublish: ({ items }) => api.bulkScheduleUnpublish({ items }),
    cancelArticlesPublishSchedule: ({ ids }) => api.bulkCancelPublishSchedule({ ids }),
    cancelArticlesUnpublishSchedule: ({ ids }) => api.bulkCancelUnpublishSchedule({ ids }),
    processScheduledArticles: api.processScheduled,

    archiveArticle: ({ articleId, reason }) => api.archive(articleId, reason),
    restoreArchivedArticle: ({ articleId }) => api.restoreArchived(articleId),
    archiveArticles: ({ ids, reason }) => api.bulkArchive({ ids, reason }),
    restoreArchivedArticles: ({ ids }) => api.bulkRestoreArchived({ ids }),

    unfeatureExpiredArticles,
  })
}
