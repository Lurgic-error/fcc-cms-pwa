import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/sections',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.GOVERNANCE,
        label: 'Sections',
        i18nKey: 'nav.sections',
        icon: 'mdi-view-list',
        order: 5,
      },

      breadcrumb: {
        label: 'Sections',
        i18nKey: 'breadcrumbs.sections',
      },

      page: {
        title: 'Sections',
        i18nKey: 'pages.sections.root',
      },
    },
    children: [
      {
        path: '',
        name: 'sections.list',
        component: () => import('@/pages/sections/SectionsListPage.vue'),
        meta: {
          type: 'list',
          page: {
            title: 'Sections',
            i18nKey: 'pages.sections.list',
          },
          breadcrumb: {
            label: 'List',
            i18nKey: 'breadcrumbs.list',
          },
        },
      },
      {
        path: 'create',
        name: 'sections.create',
        component: () => import('@/pages/sections/SectionCreatePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.CREATE]),
          type: 'create',
          page: {
            title: 'Create Section',
            i18nKey: 'pages.sections.create',
          },
          breadcrumb: {
            label: 'Create',
            i18nKey: 'breadcrumbs.create',
          },
        },
      },
      {
        path: ':sectionId',
        meta: {
          breadcrumb: {
            dynamic: true,
            resolver: 'section',
            label: 'Section',
            i18nKey: 'breadcrumbs.section',
          },
        },
        children: [
          {
            path: '',
            name: 'sections.details',
            component: () => import('@/pages/sections/SectionDetailsPage.vue'),
            meta: {
              type: 'details',
              page: {
                title: 'Section Details',
                i18nKey: 'pages.sections.details',
              },
              breadcrumb: {
                label: 'Details',
                i18nKey: 'breadcrumbs.details',
              },
            },
          },
          {
            path: 'edit',
            name: 'sections.edit',
            component: () => import('@/pages/sections/SectionEditPage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.UPDATE]),
              type: 'edit',
              page: {
                title: 'Edit Section',
                i18nKey: 'pages.sections.edit',
              },
              breadcrumb: {
                label: 'Edit',
                i18nKey: 'breadcrumbs.edit',
              },
            },
          },
          {
            path: 'management',
            name: 'sections.management',
            component: () => import('@/pages/sections/SectionManagementPage.vue'),
            meta: {
              type: 'management',
              page: {
                title: 'Section Management',
                i18nKey: 'pages.sections.management',
              },
              breadcrumb: {
                label: 'Management',
                i18nKey: 'breadcrumbs.management',
              },
            },
          },
          {
            path: 'assignments',
            name: 'sections.assignments',
            component: () => import('@/pages/sections/SectionAssignmentsPage.vue'),
            meta: {
              type: 'assignments',
              page: {
                title: 'Section Assignments',
                i18nKey: 'pages.sections.assignments',
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
