import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS, ROLES } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/publications',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.CONTENT,
        label: 'Publications Management',
        i18nKey: 'nav.publications',
        icon: 'mdi-book-open-page-variant',
        order: 2,
      },

      breadcrumb: {
        label: 'Publications Management',
        i18nKey: 'breadcrumbs.publications',
      },

      page: {
        title: 'Publications Management',
        i18nKey: 'pages.publications.root',
      },
    },

    children: [
      /* =========================
       * PUBLICATIONS — LIST / CREATE
       * ========================= */
      {
        path: '',
        name: 'publications.list',
        component: () => import('@/pages/publications/PublicationsListPage.vue'),
        meta: {
          type: 'list',
          breadcrumb: { label: 'List', i18nKey: 'breadcrumbs.list' },
          page: { title: 'Publications Management', i18nKey: 'pages.publications.list' },
        },
      },

      {
        path: 'create',
        name: 'publications.create',
        component: () => import('@/pages/publications/PublicationCreatePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.CREATE]),
          roles: [ROLES.ADMIN, ROLES.EDITOR],
          type: 'create',
          breadcrumb: { label: 'Create', i18nKey: 'breadcrumbs.create' },
          page: { title: 'Create Publication', i18nKey: 'pages.publications.create' },
        },
      },

      /* =========================
       * PUBLICATIONS — WORKFLOW / ARCHIVE
       * ========================= */
      {
        path: 'review-queue',
        name: 'publications.reviewQueue',
        component: () => import('@/pages/publications/PublicationReviewQueuePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.REVIEW]),
          roles: [ROLES.REVIEWER, ROLES.ADMIN],
          type: 'review',
          breadcrumb: { label: 'Review Queue', i18nKey: 'breadcrumbs.reviewQueue' },
          page: { title: 'Publication Review Queue', i18nKey: 'pages.publications.reviewQueue' },
        },
      },

      {
        path: 'archive',
        name: 'publications.archive',
        component: () => import('@/pages/publications/PublicationArchivePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.ARCHIVE]),
          roles: [ROLES.ADMIN],
          type: 'archive',
          breadcrumb: { label: 'Archive', i18nKey: 'breadcrumbs.archive' },
          page: { title: 'Publication Archive', i18nKey: 'pages.publications.archive' },
        },
      },

      /* =========================
       * PUBLICATION CONTEXT (PARENT)
       * ========================= */
      {
        path: ':publicationId',
        meta: {
          breadcrumb: {
            dynamic: true,
            resolver: 'publication',
            label: 'Publication',
            i18nKey: 'breadcrumbs.publication',
          },
        },
        children: [
          {
            path: '',
            name: 'publications.details',
            component: () => import('@/pages/publications/PublicationDetailsPage.vue'),
            meta: {
              type: 'details',
              breadcrumb: { label: 'Details', i18nKey: 'breadcrumbs.details' },
              page: { title: 'Publication Details', i18nKey: 'pages.publications.details' },
            },
          },

          {
            path: 'edit',
            name: 'publications.edit',
            component: () => import('@/pages/publications/PublicationEditPage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.UPDATE]),
              roles: [ROLES.ADMIN, ROLES.EDITOR],
              allowedStates: ['draft', 'rejected'],
              type: 'edit',
              breadcrumb: { label: 'Edit', i18nKey: 'breadcrumbs.edit' },
              page: { title: 'Edit Publication', i18nKey: 'pages.publications.edit' },
            },
          },

          {
            path: 'schedule',
            name: 'publications.schedule',
            component: () => import('@/pages/publications/PublicationSchedulePage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.PUBLISH]),
              roles: [ROLES.PUBLISHER, ROLES.ADMIN],
              allowedStates: ['approved', 'published', 'scheduled', 'unpublished'],
              type: 'schedule',
              breadcrumb: { label: 'Schedule', i18nKey: 'breadcrumbs.schedule' },
              page: { title: 'Schedule Publication', i18nKey: 'pages.publications.schedule' },
            },
          },

          {
            path: 'history',
            name: 'publications.history',
            component: () => import('@/pages/publications/PublicationHistoryPage.vue'),
            meta: {
              type: 'history',
              breadcrumb: { label: 'History', i18nKey: 'breadcrumbs.history' },
              page: { title: 'Publication History', i18nKey: 'pages.publications.history' },
            },
          },
        ],
      },

      /* =========================================================
       * PUBLICATION CATEGORIES (FULL LIFECYCLE + WORKFLOW PARITY)
       * ========================================================= */
      {
        path: 'categories',
        meta: {
          breadcrumb: { label: 'Categories', i18nKey: 'breadcrumbs.categories' },
          page: { title: 'Publication Categories', i18nKey: 'pages.publications.categories.root' },
        },
        children: [
          /* ----- LIST ----- */
          {
            path: '',
            name: 'publicationCategories.list',
            component: () => import('@/pages/publications/PublicationCategoriesListPage.vue'),
            meta: {
              type: 'list',
              breadcrumb: { label: 'List', i18nKey: 'breadcrumbs.list' },
              page: { title: 'Categories', i18nKey: 'pages.publications.categories.list' },
            },
          },

          /* ----- CREATE ----- */
          {
            path: 'create',
            name: 'publicationCategories.create',
            component: () => import('@/pages/publications/PublicationCategoryCreatePage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.CREATE]),
              roles: [ROLES.ADMIN, ROLES.EDITOR],
              type: 'create',
              breadcrumb: { label: 'Create', i18nKey: 'breadcrumbs.create' },
              page: { title: 'Create Category', i18nKey: 'pages.publications.categories.create' },
            },
          },

          /* ----- REVIEW QUEUE ----- */
          {
            path: 'review-queue',
            name: 'publicationCategories.reviewQueue',
            component: () => import('@/pages/publications/PublicationCategoryReviewQueuePage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.REVIEW]),
              roles: [ROLES.REVIEWER, ROLES.ADMIN],
              type: 'review',
              breadcrumb: { label: 'Review Queue', i18nKey: 'breadcrumbs.reviewQueue' },
              page: {
                title: 'Category Review Queue',
                i18nKey: 'pages.publications.categories.reviewQueue',
              },
            },
          },

          /* ----- ARCHIVE ----- */
          {
            path: 'archive',
            name: 'publicationCategories.archive',
            component: () => import('@/pages/publications/PublicationCategoryArchivePage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.ARCHIVE]),
              roles: [ROLES.ADMIN],
              type: 'archive',
              breadcrumb: { label: 'Archive', i18nKey: 'breadcrumbs.archive' },
              page: { title: 'Category Archive', i18nKey: 'pages.publications.categories.archive' },
            },
          },

          /* ----- CATEGORY CONTEXT (PARENT) ----- */
          {
            path: ':categoryId',
            meta: {
              breadcrumb: {
                dynamic: true,
                resolver: 'publicationCategory',
                label: 'Category',
                i18nKey: 'breadcrumbs.publicationCategory',
              },
            },
            children: [
              {
                path: '',
                name: 'publicationCategories.details',
                component: () => import('@/pages/publications/PublicationCategoryDetailsPage.vue'),
                meta: {
                  type: 'details',
                  breadcrumb: { label: 'Details', i18nKey: 'breadcrumbs.details' },
                  page: {
                    title: 'Category Details',
                    i18nKey: 'pages.publications.categories.details',
                  },
                },
              },

              {
                path: 'edit',
                name: 'publicationCategories.edit',
                component: () => import('@/pages/publications/PublicationCategoryEditPage.vue'),
                meta: {
                  ...requirePermission([PERMISSIONS.UPDATE]),
                  roles: [ROLES.ADMIN, ROLES.EDITOR],
                  allowedStates: ['draft', 'rejected'],
                  type: 'edit',
                  breadcrumb: { label: 'Edit', i18nKey: 'breadcrumbs.edit' },
                  page: { title: 'Edit Category', i18nKey: 'pages.publications.categories.edit' },
                },
              },

              {
                path: 'schedule',
                name: 'publicationCategories.schedule',
                component: () => import('@/pages/publications/PublicationCategorySchedulePage.vue'),
                meta: {
                  ...requirePermission([PERMISSIONS.PUBLISH]),
                  roles: [ROLES.PUBLISHER, ROLES.ADMIN],
                  allowedStates: ['approved', 'published', 'scheduled', 'unpublished'],
                  type: 'schedule',
                  breadcrumb: { label: 'Schedule', i18nKey: 'breadcrumbs.schedule' },
                  page: {
                    title: 'Category Schedule',
                    i18nKey: 'pages.publications.categories.schedule',
                  },
                },
              },

              {
                path: 'history',
                name: 'publicationCategories.history',
                component: () => import('@/pages/publications/PublicationCategoryHistoryPage.vue'),
                meta: {
                  type: 'history',
                  breadcrumb: { label: 'History', i18nKey: 'breadcrumbs.history' },
                  page: {
                    title: 'Category History',
                    i18nKey: 'pages.publications.categories.history',
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
]
