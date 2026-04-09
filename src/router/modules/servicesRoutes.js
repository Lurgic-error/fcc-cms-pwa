import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/services',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.GOVERNANCE,
        label: 'Services',
        i18nKey: 'nav.services',
        icon: 'mdi-cog-outline',
        order: 8,
      },

      breadcrumb: {
        label: 'Services',
        i18nKey: 'breadcrumbs.services',
      },

      page: {
        title: 'Services',
        i18nKey: 'pages.services.root',
      },
    },
    children: [
      {
        path: '',
        name: 'services.list',
        component: () => import('@/pages/services/ServicesListPage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.CREATE, PERMISSIONS.UPDATE]),
          type: 'list',
          page: {
            title: 'Services',
            i18nKey: 'pages.services.list',
          },
          breadcrumb: {
            label: 'List',
            i18nKey: 'breadcrumbs.list',
          },
        },
      },
      {
        path: 'create',
        name: 'services.create',
        component: () => import('@/pages/services/ServiceCreatePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.CREATE]),
          type: 'create',
          page: {
            title: 'Create Service',
            i18nKey: 'pages.services.create',
          },
          breadcrumb: {
            label: 'Create',
            i18nKey: 'breadcrumbs.create',
          },
        },
      },
      {
        path: ':serviceId',
        meta: {
          breadcrumb: {
            dynamic: true,
            resolver: 'service',
            label: 'Service',
            i18nKey: 'breadcrumbs.service',
          },
        },
        children: [
          {
            path: '',
            name: 'services.details',
            component: () => import('@/pages/services/ServiceDetailsPage.vue'),
            meta: {
              type: 'details',
              page: {
                title: 'Service Details',
                i18nKey: 'pages.services.details',
              },
              breadcrumb: {
                label: 'Details',
                i18nKey: 'breadcrumbs.details',
              },
            },
          },
          {
            path: 'edit',
            name: 'services.edit',
            component: () => import('@/pages/services/ServiceEditPage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.UPDATE]),
              type: 'edit',
              page: {
                title: 'Edit Service',
                i18nKey: 'pages.services.edit',
              },
              breadcrumb: {
                label: 'Edit',
                i18nKey: 'breadcrumbs.edit',
              },
            },
          },
          {
            path: 'ownership',
            name: 'services.ownership',
            component: () => import('@/pages/services/ServiceOwnershipPage.vue'),
            meta: {
              type: 'ownership',
              page: {
                title: 'Service Ownership',
                i18nKey: 'pages.services.ownership',
              },
              breadcrumb: {
                label: 'Ownership',
                i18nKey: 'breadcrumbs.ownership',
              },
            },
          },
        ],
      },
    ],
  },
]
