import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS, ROLES } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/questions',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.CONTENT,
        label: 'FAQs',
        i18nKey: 'nav.questions',
        icon: 'mdi-help-circle-outline',
        order: 3,
      },

      breadcrumb: {
        label: 'FAQs',
        i18nKey: 'breadcrumbs.questions',
      },
    },
    children: [
      {
        path: '',
        name: 'questions.list',
        component: () => import('@/pages/questions/QuestionsListPage.vue'),
        meta: {
          type: 'list',
          breadcrumb: { label: 'List', i18nKey: 'breadcrumbs.list' },
        },
      },
      {
        path: 'create',
        name: 'questions.create',
        component: () => import('@/pages/questions/QuestionCreatePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.CREATE]),
          roles: [ROLES.EDITOR, ROLES.PUBLISHER],
          type: 'create',
          breadcrumb: { label: 'Create', i18nKey: 'breadcrumbs.create' },
        },
      },
      {
        path: 'review-queue',
        name: 'questions.reviewQueue',
        component: () => import('@/pages/questions/QuestionReviewQueuePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.REVIEW]),
          roles: [ROLES.REVIEWER, ROLES.PUBLISHER],
          type: 'review',
          breadcrumb: {
            label: 'Review Queue',
            i18nKey: 'breadcrumbs.reviewQueue',
          },
        },
      },
      {
        path: ':questionId',
        meta: {
          breadcrumb: {
            dynamic: true,
            resolver: 'question',
            label: 'Question',
            i18nKey: 'breadcrumbs.question',
          },
        },
        children: [
          {
            path: '',
            name: 'questions.details',
            component: () => import('@/pages/questions/QuestionDetailsPage.vue'),
            meta: {
              type: 'details',
              breadcrumb: { label: 'Details', i18nKey: 'breadcrumbs.details' },
            },
          },
          {
            path: 'edit',
            name: 'questions.edit',
            component: () => import('@/pages/questions/QuestionEditPage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.UPDATE]),
              allowedStates: ['draft', 'rejected'],
              type: 'edit',
              breadcrumb: { label: 'Edit', i18nKey: 'breadcrumbs.edit' },
            },
          },
          {
            path: 'history',
            name: 'questions.history',
            component: () => import('@/pages/questions/QuestionHistoryPage.vue'),
            meta: {
              type: 'history',
              breadcrumb: {
                label: 'History',
                i18nKey: 'breadcrumbs.history',
              },
            },
          },
        ],
      },
    ],
  },
]
