import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/committees',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.GOVERNANCE,
        label: 'Committees',
        i18nKey: 'nav.committees',
        icon: 'mdi-account-group',
        order: 3,
      },

      breadcrumb: {
        label: 'Committees',
        i18nKey: 'breadcrumbs.committees',
      },

      page: {
        title: 'Committees',
        i18nKey: 'pages.committees.root',
      },
    },
    children: [
      {
        path: '',
        name: 'committees.list',
        component: () => import('@/pages/committees/CommitteesListPage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.CREATE, PERMISSIONS.UPDATE]),
          type: 'list',
          page: {
            title: 'Committees',
            i18nKey: 'pages.committees.list',
          },
          breadcrumb: {
            label: 'List',
            i18nKey: 'breadcrumbs.list',
          },
        },
      },
      {
        path: 'create',
        name: 'committees.create',
        component: () => import('@/pages/committees/CommitteeCreatePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.CREATE]),
          type: 'create',
          page: {
            title: 'Create Committee',
            i18nKey: 'pages.committees.create',
          },
          breadcrumb: {
            label: 'Create',
            i18nKey: 'breadcrumbs.create',
          },
        },
      },
      {
        path: ':committeeId',
        meta: {
          breadcrumb: {
            dynamic: true,
            resolver: 'committee',
            label: 'Committee',
            i18nKey: 'breadcrumbs.committee',
          },
        },
        children: [
          {
            path: '',
            name: 'committees.details',
            component: () => import('@/pages/committees/CommitteeDetailsPage.vue'),
            meta: {
              type: 'details',
              page: {
                title: 'Committee Details',
                i18nKey: 'pages.committees.details',
              },
              breadcrumb: {
                label: 'Details',
                i18nKey: 'breadcrumbs.details',
              },
            },
          },
          {
            path: 'edit',
            name: 'committees.edit',
            component: () => import('@/pages/committees/CommitteeEditPage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.UPDATE]),
              type: 'edit',
              page: {
                title: 'Edit Committee',
                i18nKey: 'pages.committees.edit',
              },
              breadcrumb: {
                label: 'Edit',
                i18nKey: 'breadcrumbs.edit',
              },
            },
          },
          {
            path: 'membership',
            name: 'committees.membership',
            component: () => import('@/pages/committees/CommitteeMembershipPage.vue'),
            meta: {
              type: 'membership',
              page: {
                title: 'Committee Membership',
                i18nKey: 'pages.committees.membership',
              },
              breadcrumb: {
                label: 'Membership',
                i18nKey: 'breadcrumbs.membership',
              },
            },
          },
        ],
      },
    ],
  },
]
