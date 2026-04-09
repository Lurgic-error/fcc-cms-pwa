import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS, ROLES } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/videos',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.CONTENT,
        label: 'Videos',
        i18nKey: 'nav.videos',
        icon: 'mdi-video-outline',
        order: 4,
      },

      breadcrumb: {
        label: 'Videos',
        i18nKey: 'breadcrumbs.videos',
      },
    },
    children: [
      {
        path: '',
        name: 'videos.list',
        component: () => import('@/pages/videos/VideosListPage.vue'),
        meta: {
          type: 'list',
          breadcrumb: { label: 'List', i18nKey: 'breadcrumbs.list' },
        },
      },
      {
        path: 'create',
        name: 'videos.create',
        component: () => import('@/pages/videos/VideoCreatePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.CREATE]),
          roles: [ROLES.EDITOR, ROLES.ADMIN],
          type: 'create',
          breadcrumb: { label: 'Create', i18nKey: 'breadcrumbs.create' },
        },
      },
      {
        path: 'review-queue',
        name: 'videos.reviewQueue',
        component: () => import('@/pages/videos/VideoReviewQueuePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.REVIEW]),
          roles: [ROLES.REVIEWER, ROLES.ADMIN],
          type: 'review',
          breadcrumb: {
            label: 'Review Queue',
            i18nKey: 'breadcrumbs.reviewQueue',
          },
        },
      },
      {
        path: 'archive',
        name: 'videos.archive',
        component: () => import('@/pages/videos/VideoArchivePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.ARCHIVE]),
          roles: [ROLES.ADMIN],
          type: 'archive',
          breadcrumb: {
            label: 'Archive',
            i18nKey: 'breadcrumbs.archive',
          },
        },
      },
      {
        path: ':videoId',
        meta: {
          breadcrumb: {
            dynamic: true,
            resolver: 'video',
            label: 'Video',
            i18nKey: 'breadcrumbs.video',
          },
        },
        children: [
          {
            path: '',
            name: 'videos.details',
            component: () => import('@/pages/videos/VideoDetailsPage.vue'),
            meta: {
              type: 'details',
              breadcrumb: { label: 'Details', i18nKey: 'breadcrumbs.details' },
            },
          },
          {
            path: 'edit',
            name: 'videos.edit',
            component: () => import('@/pages/videos/VideoEditPage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.UPDATE]),
              allowedStates: ['draft', 'rejected'],
              type: 'edit',
              breadcrumb: { label: 'Edit', i18nKey: 'breadcrumbs.edit' },
            },
          },
        ],
      },
    ],
  },
]
