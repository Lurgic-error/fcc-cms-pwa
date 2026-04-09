import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/units',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.GOVERNANCE,
        label: 'Units',
        i18nKey: 'nav.units',
        icon: 'mdi-domain-outline',
        order: 6,
      },

      breadcrumb: {
        label: 'Units',
        i18nKey: 'breadcrumbs.units',
      },

      page: {
        title: 'Units',
        i18nKey: 'pages.units.root',
      },
    },
    children: [
      {
        path: '',
        name: 'units.list',
        component: () => import('@/pages/units/UnitsListPage.vue'),
        meta: {
          type: 'list',
          page: {
            title: 'Units',
            i18nKey: 'pages.units.list',
          },
          breadcrumb: {
            label: 'List',
            i18nKey: 'breadcrumbs.list',
          },
        },
      },
      {
        path: 'create',
        name: 'units.create',
        component: () => import('@/pages/units/UnitCreatePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.CREATE]),
          type: 'create',
          page: {
            title: 'Create Unit',
            i18nKey: 'pages.units.create',
          },
          breadcrumb: {
            label: 'Create',
            i18nKey: 'breadcrumbs.create',
          },
        },
      },
      {
        path: ':unitId',
        meta: {
          breadcrumb: {
            dynamic: true,
            resolver: 'unit',
            label: 'Unit',
            i18nKey: 'breadcrumbs.unit',
          },
        },
        children: [
          {
            path: '',
            name: 'units.details',
            component: () => import('@/pages/units/UnitDetailsPage.vue'),
            meta: {
              type: 'details',
              page: {
                title: 'Unit Details',
                i18nKey: 'pages.units.details',
              },
              breadcrumb: {
                label: 'Details',
                i18nKey: 'breadcrumbs.details',
              },
            },
          },
          {
            path: 'edit',
            name: 'units.edit',
            component: () => import('@/pages/units/UnitEditPage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.UPDATE]),
              type: 'edit',
              page: {
                title: 'Edit Unit',
                i18nKey: 'pages.units.edit',
              },
              breadcrumb: {
                label: 'Edit',
                i18nKey: 'breadcrumbs.edit',
              },
            },
          },
          {
            path: 'assignments',
            name: 'units.assignments',
            component: () => import('@/pages/units/UnitAssignmentsPage.vue'),
            meta: {
              type: 'assignments',
              page: {
                title: 'Unit Assignments',
                i18nKey: 'pages.units.assignments',
              },
              breadcrumb: {
                label: 'Assignments',
                i18nKey: 'breadcrumbs.assignments',
              },
            },
          },
        ],
      },
    ],
  },
]
