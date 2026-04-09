import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/offices',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.GOVERNANCE,
        label: 'Offices',
        i18nKey: 'nav.offices',
        icon: 'mdi-domain',
        order: 7,
      },

      breadcrumb: {
        label: 'Offices',
        i18nKey: 'breadcrumbs.offices',
      },

      page: {
        title: 'Offices',
        i18nKey: 'pages.offices.root',
      },
    },
    children: [
      {
        path: '',
        name: 'offices.list',
        component: () => import('@/pages/offices/OfficesListPage.vue'),
        meta: {
          type: 'list',
          page: {
            title: 'Offices',
            i18nKey: 'pages.offices.list',
          },
          breadcrumb: {
            label: 'List',
            i18nKey: 'breadcrumbs.list',
          },
        },
      },
      {
        path: 'create',
        name: 'offices.create',
        component: () => import('@/pages/offices/OfficeCreatePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.CREATE]),
          type: 'create',
          page: {
            title: 'Create Office',
            i18nKey: 'pages.offices.create',
          },
          breadcrumb: {
            label: 'Create',
            i18nKey: 'breadcrumbs.create',
          },
        },
      },
      {
        path: ':officeId',
        meta: {
          breadcrumb: {
            dynamic: true,
            resolver: 'office',
            label: 'Office',
            i18nKey: 'breadcrumbs.office',
          },
        },
        children: [
          {
            path: '',
            name: 'offices.details',
            component: () => import('@/pages/offices/OfficeDetailsPage.vue'),
            meta: {
              type: 'details',
              page: {
                title: 'Office Details',
                i18nKey: 'pages.offices.details',
              },
              breadcrumb: {
                label: 'Details',
                i18nKey: 'breadcrumbs.details',
              },
            },
          },
          {
            path: 'edit',
            name: 'offices.edit',
            component: () => import('@/pages/offices/OfficeEditPage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.UPDATE]),
              type: 'edit',
              page: {
                title: 'Edit Office',
                i18nKey: 'pages.offices.edit',
              },
              breadcrumb: {
                label: 'Edit',
                i18nKey: 'breadcrumbs.edit',
              },
            },
          },
          {
            path: 'assignments',
            name: 'offices.assignments',
            component: () => import('@/pages/offices/OfficeAssignmentsPage.vue'),
            meta: {
              type: 'assignments',
              page: {
                title: 'Office Assignments',
                i18nKey: 'pages.offices.assignments',
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
