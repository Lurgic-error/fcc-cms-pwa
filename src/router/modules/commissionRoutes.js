import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/commission',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.GOVERNANCE,
        label: 'Commission',
        i18nKey: 'nav.commission',
        icon: 'mdi-bank',
        order: 1,
      },

      breadcrumb: {
        label: 'Commission',
        i18nKey: 'breadcrumbs.commission',
      },
    },
    children: [
      {
        path: '',
        name: 'commission.details',
        component: () => import('@/pages/commission/CommissionDetailsPage.vue'),
        meta: {
          page: {
            title: 'Commission Overview',
            i18nKey: 'pages.commission.details',
          },
          type: 'details',
        },
      },
      {
        path: 'create',
        name: 'commission.create',
        component: () => import('@/pages/commission/CommissionCreatePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.UPDATE]),
          page: {
            title: 'Create Commission',
            i18nKey: 'pages.commission.create',
          },
          breadcrumb: {
            label: 'Create',
            i18nKey: 'breadcrumbs.create',
          },
          type: 'create',
        },
      },
      {
        path: 'edit',
        name: 'commission.edit',
        component: () => import('@/pages/commission/CommissionEditPage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.UPDATE]),
          page: {
            title: 'Edit Commission',
            i18nKey: 'pages.commission.edit',
          },
          breadcrumb: {
            label: 'Edit',
            i18nKey: 'breadcrumbs.edit',
          },
          type: 'edit',
        },
      },
      {
        path: 'history',
        name: 'commission.history',
        component: () => import('@/pages/commission/CommissionHistoryPage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.UPDATE]),
          page: {
            title: 'Commission History',
            i18nKey: 'pages.commission.history',
          },
          breadcrumb: {
            label: 'History',
            i18nKey: 'breadcrumbs.history',
          },
          type: 'history',
        },
      },
    ],
  },
]
