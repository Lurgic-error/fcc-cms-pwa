import { defineStore } from 'pinia'
import { ref } from 'vue'

import { articlesAPI } from '@/api'
import {
  createWorkflowApiAdapter,
  createWorkflowBoundStore,
  loadWorkflowCollection,
  runWorkflowReloadingRequest,
} from '@/stores/_shared/workflowStoreHelpers'

function buildArticlesApiAdapter() {
  return createWorkflowApiAdapter({
    api: articlesAPI,
    idField: 'articleId',
    payloadKey: 'articleInfo',
    methods: {
      list: 'listArticles',
      find: 'findArticle',
      listPublished: 'listPublishedArticles',
      listArchived: 'listArchivedArticles',
      create: 'createArticle',
      bulkCreate: 'createArticles',
      update: 'updateArticle',
      bulkUpdate: 'updateArticles',
      remove: 'deleteArticle',
      bulkRemove: 'deleteArticles',
      softDelete: 'softDeleteArticle',
      bulkSoftDelete: 'softDeleteArticles',
      restore: 'restoreArticle',
      bulkRestore: 'restoreArticles',
      submit: 'submitArticleForApproval',
      approve: 'approveArticle',
      reject: 'rejectArticle',
      publish: 'publishArticle',
      bulkPublish: 'publishArticles',
      unpublish: 'unpublishArticle',
      bulkUnpublish: 'unpublishArticles',
      schedulePublish: 'scheduleArticlePublish',
      scheduleUnpublish: 'scheduleArticleUnpublish',
      bulkSchedulePublish: 'scheduleArticlesPublish',
      bulkScheduleUnpublish: 'scheduleArticlesUnpublish',
      cancelPublishSchedule: 'cancelArticlePublishSchedule',
      cancelUnpublishSchedule: 'cancelArticleUnpublishSchedule',
      bulkCancelPublishSchedule: 'cancelArticlesPublishSchedule',
      bulkCancelUnpublishSchedule: 'cancelArticlesUnpublishSchedule',
      archive: 'archiveArticle',
      bulkArchive: 'archiveArticles',
      restoreArchived: 'restoreArchivedArticle',
      bulkRestoreArchived: 'restoreArchivedArticles',
      processScheduled: 'processScheduledArticles',
    },
  })
}

export const useArticlesStore = defineStore('articles', () => {
  return createWorkflowBoundStore({
    workflowConfig: {
      api: buildArticlesApiAdapter(),
      idField: 'articleId',
      entityKey: 'article',
      collectionKeys: ['articles'],
      detailsRouteName: 'articles.details',
      navigateOnUpdate: true,
    },
    bindings: {
      entityRefKey: 'article',
      collectionRefKey: 'articles',
      publishedRefKey: 'publishedArticles',
      archivedRefKey: 'archivedArticles',
      hasRefKey: 'hasArticle',
      singular: 'Article',
      plural: 'Articles',
      includeProcessScheduled: true,
    },
    extraState() {
      return {
        featuredArticles: ref([]),
        featureRequestedArticles: ref([]),
        approvedReadyForPublish: ref([]),
      }
    },
    extraActions({
      workflowStore,
      featuredArticles,
      featureRequestedArticles,
      approvedReadyForPublish,
    }) {
      return {
        findFeaturedArticles(query = {}) {
          return loadWorkflowCollection({
            workflowStore,
            request: articlesAPI.findFeaturedArticles,
            target: featuredArticles,
            keys: ['items', 'articles', 'data'],
            query,
          })
        },
        findFeatureRequestedArticles(query = {}) {
          return loadWorkflowCollection({
            workflowStore,
            request: articlesAPI.findFeatureRequestedArticles,
            target: featureRequestedArticles,
            keys: ['items', 'articles', 'data'],
            query,
          })
        },
        findApprovedReadyForPublish(query = {}) {
          return loadWorkflowCollection({
            workflowStore,
            request: articlesAPI.findApprovedReadyForPublish,
            target: approvedReadyForPublish,
            keys: ['items', 'articles', 'data'],
            query,
          })
        },
        unfeatureExpiredArticles() {
          return runWorkflowReloadingRequest({
            workflowStore,
            request: () => articlesAPI.unfeatureExpiredArticles(),
          })
        },
      }
    },
  })
})
