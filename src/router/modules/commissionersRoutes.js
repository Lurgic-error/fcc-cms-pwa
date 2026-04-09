import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/commissioners',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.GOVERNANCE,
        label: 'Commissioners',
        i18nKey: 'nav.commissioners',
        icon: 'mdi-account-tie',
        order: 2,
      },

      breadcrumb: {
        label: 'Commissioners',
        i18nKey: 'breadcrumbs.commissioners',
      },
    },
    children: [
      {
        path: '',
        name: 'commissioners.list',
        component: () => import('@/pages/commissioners/CommissionersListPage.vue'),
        meta: {
          page: {
            title: 'Commissioners',
            i18nKey: 'pages.commissioners.list',
          },
          type: 'list',
        },
      },
      {
        path: 'create',
        name: 'commissioners.create',
        component: () => import('@/pages/commissioners/CommissionerCreatePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.CREATE]),
          page: {
            title: 'Create Commissioner',
            i18nKey: 'pages.commissioners.create',
          },
          breadcrumb: {
            label: 'Create',
            i18nKey: 'breadcrumbs.create',
          },
          type: 'create',
        },
      },
      {
        path: ':commissionerId',
        meta: {
          breadcrumb: {
            dynamic: true,
            resolver: 'commissioner',
          },
        },
        children: [
          {
            path: '',
            name: 'commissioners.details',
            component: () => import('@/pages/commissioners/CommissionerDetailsPage.vue'),
            meta: {
              page: {
                title: 'Commissioner Details',
                i18nKey: 'pages.commissioners.details',
              },
              type: 'details',
            },
          },
          {
            path: 'edit',
            name: 'commissioners.edit',
            component: () => import('@/pages/commissioners/CommissionerEditPage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.UPDATE]),
              page: {
                title: 'Edit Commissioner',
                i18nKey: 'pages.commissioners.edit',
              },
              breadcrumb: {
                label: 'Edit',
                i18nKey: 'breadcrumbs.edit',
              },
              type: 'edit',
            },
          },
          {
            path: 'assignments',
            name: 'commissioners.assignments',
            component: () => import('@/pages/commissioners/CommissionerAssignmentsPage.vue'),
            meta: {
              page: {
                title: 'Assignments',
                i18nKey: 'pages.commissioners.assignments',
              },
              breadcrumb: {
                label: 'Assignments',
                i18nKey: 'breadcrumbs.assignments',
              },
              type: 'assignment',
            },
          },
        ],
      },
    ],
  },
]
