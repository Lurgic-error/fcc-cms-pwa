import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS, ROLES } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/articles',
    component: CmsLayout,
    meta: {
      ...requireAuth,
      nav: {
        section: NAV_SECTIONS.CONTENT,
        label: 'Articles',
        icon: 'mdi-newspaper-variant-outline',
        order: 3,
      },
      breadcrumb: { label: 'Articles' },
      page: { title: 'Articles' },
    },
    children: [
      {
        path: '',
        name: 'articles.list',
        component: () => import('@/pages/articles/ArticlesListPage.vue'),
        meta: {
          type: 'list',
          breadcrumb: { label: 'List', i18nKey: 'breadcrumbs.list' },
          page: { title: 'Articles' },
        },
      },
      {
        path: 'create',
        name: 'articles.create',
        component: () => import('@/pages/articles/ArticleCreatePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.CREATE]),
          roles: [ROLES.PUBLISHER, ROLES.EDITOR],
          type: 'create',
          breadcrumb: { label: 'Create', i18nKey: 'breadcrumbs.create' },
          page: { title: 'Create Article' },
        },
      },
      {
        path: ':articleId',
        meta: {
          breadcrumb: {
            dynamic: true,
            resolver: 'article',
            label: 'Article',
          },
        },
        children: [
          {
            path: '',
            name: 'articles.details',
            component: () => import('@/pages/articles/ArticleDetailsPage.vue'),
            meta: {
              type: 'details',
              breadcrumb: { label: 'Details', i18nKey: 'breadcrumbs.details' },
              page: { title: 'Article Details' },
            },
          },
          {
            path: 'edit',
            name: 'articles.edit',
            component: () => import('@/pages/articles/ArticleEditPage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.UPDATE]),
              roles: [ROLES.PUBLISHER, ROLES.EDITOR],
              type: 'edit',
              breadcrumb: { label: 'Edit', i18nKey: 'breadcrumbs.edit' },
              page: { title: 'Edit Article' },
            },
          },
        ],
      },
      {
        path: ':articleId/schedule',
        name: 'articles.schedule',
        component: () => import('@/pages/articles/ArticleSchedulePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.PUBLISH]),
          roles: [ROLES.PUBLISHER],
          type: 'schedule',
          breadcrumb: { label: 'Schedule', i18nKey: 'breadcrumbs.schedule' },
          page: { title: 'Schedule Article' },
          workflow: {
            entity: 'article',
            transition: 'schedule',
            allowedStates: ['approved', 'published', 'scheduled', 'unpublished'],
          },
        },
      },
    ],
  },
]
