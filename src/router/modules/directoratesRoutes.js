import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/directorates',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.GOVERNANCE,
        label: 'Directorates',
        i18nKey: 'nav.directorates',
        icon: 'mdi-office-building',
        order: 4,
      },

      breadcrumb: {
        label: 'Directorates',
        i18nKey: 'breadcrumbs.directorates',
      },

      page: {
        title: 'Directorates',
        i18nKey: 'pages.directorates.root',
      },
    },
    children: [
      {
        path: '',
        name: 'directorates.list',
        component: () => import('@/pages/directorates/DirectoratesListPage.vue'),
        meta: {
          type: 'list',
          page: {
            title: 'Directorates',
            i18nKey: 'pages.directorates.list',
          },
          breadcrumb: {
            label: 'List',
            i18nKey: 'breadcrumbs.list',
          },
        },
      },
      {
        path: 'create',
        name: 'directorates.create',
        component: () => import('@/pages/directorates/DirectorateCreatePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.CREATE]),
          type: 'create',
          page: {
            title: 'Create Directorate',
            i18nKey: 'pages.directorates.create',
          },
          breadcrumb: {
            label: 'Create',
            i18nKey: 'breadcrumbs.create',
          },
        },
      },
      {
        path: ':directorateId',
        meta: {
          breadcrumb: {
            dynamic: true,
            resolver: 'directorate',
            label: 'Directorate',
            i18nKey: 'breadcrumbs.directorate',
          },
        },
        children: [
          {
            path: '',
            name: 'directorates.details',
            component: () => import('@/pages/directorates/DirectorateDetailsPage.vue'),
            meta: {
              type: 'details',
              page: {
                title: 'Directorate Details',
                i18nKey: 'pages.directorates.details',
              },
              breadcrumb: {
                label: 'Details',
                i18nKey: 'breadcrumbs.details',
              },
            },
          },
          {
            path: 'edit',
            name: 'directorates.edit',
            component: () => import('@/pages/directorates/DirectorateEditPage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.UPDATE]),
              type: 'edit',
              page: {
                title: 'Edit Directorate',
                i18nKey: 'pages.directorates.edit',
              },
              breadcrumb: {
                label: 'Edit',
                i18nKey: 'breadcrumbs.edit',
              },
            },
          },
          {
            path: 'structure',
            name: 'directorates.structure',
            component: () => import('@/pages/directorates/DirectorateStructurePage.vue'),
            meta: {
              type: 'structure',
              page: {
                title: 'Directorate Structure',
                i18nKey: 'pages.directorates.structure',
              },
              breadcrumb: {
                label: 'Structure',
                i18nKey: 'breadcrumbs.structure',
              },
            },
          },
          {
            path: 'management',
            name: 'directorates.management',
            component: () => import('@/pages/directorates/DirectorateManagementPage.vue'),
            meta: {
              type: 'management',
              page: {
                title: 'Directorate Management',
                i18nKey: 'pages.directorates.management',
              },
              breadcrumb: {
                label: 'Management',
                i18nKey: 'breadcrumbs.management',
              },
            },
          },
        ],
      },
    ],
  },
]
