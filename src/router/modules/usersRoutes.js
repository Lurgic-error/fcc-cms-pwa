import { NAV_SECTIONS } from '@/navigation/navSections'
import { ROLES } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requireRole } from '@/router/middleware'

export default [
  {
    path: '/users',
    component: CmsLayout,
    meta: {
      ...requireAuth,
      ...requireRole([ROLES.ADMIN]),

      nav: {
        section: NAV_SECTIONS.USERS,
        label: 'Users',
        i18nKey: 'nav.users',
        icon: 'mdi-account-multiple',
        order: 1,
      },

      breadcrumb: {
        label: 'Users',
        i18nKey: 'breadcrumbs.users',
      },

      page: {
        title: 'Users',
        i18nKey: 'pages.users.root',
      },
    },
    children: [
      /* ================= LIST ================= */
      {
        path: '',
        name: 'users.list',
        component: () => import('@/pages/users/UsersListPage.vue'),
        meta: {
          type: 'list',
          breadcrumb: {
            label: 'List',
            i18nKey: 'breadcrumbs.list',
          },
        },
      },

      /* ================= CREATE ================= */
      {
        path: 'create',
        name: 'users.create',
        component: () => import('@/pages/users/UserCreatePage.vue'),
        meta: {
          type: 'create',
          breadcrumb: {
            label: 'Create',
            i18nKey: 'breadcrumbs.create',
          },
        },
      },

      /* ================= USER CONTEXT ================= */
      {
        path: ':userId',
        meta: {
          breadcrumb: {
            dynamic: true,
            resolver: 'user',
            label: 'User',
            i18nKey: 'breadcrumbs.user',
          },
        },
        children: [
          {
            path: '',
            name: 'users.details',
            component: () => import('@/pages/users/UserDetailsPage.vue'),
            meta: {
              type: 'details',
              breadcrumb: {
                label: 'Details',
                i18nKey: 'breadcrumbs.details',
              },
            },
          },
          {
            path: 'edit',
            name: 'users.edit',
            component: () => import('@/pages/users/UserEditPage.vue'),
            meta: {
              type: 'edit',
              breadcrumb: {
                label: 'Edit',
                i18nKey: 'breadcrumbs.edit',
              },
            },
          },
          {
            path: 'roles',
            name: 'users.roles',
            component: () => import('@/pages/users/UserRolesPage.vue'),
            meta: {
              type: 'management',
              breadcrumb: {
                label: 'Roles',
                i18nKey: 'breadcrumbs.roles',
              },
            },
          },
          {
            path: 'activity',
            name: 'users.activity',
            component: () => import('@/pages/users/UserActivityPage.vue'),
            meta: {
              type: 'audit',
              breadcrumb: {
                label: 'Activity',
                i18nKey: 'breadcrumbs.activity',
              },
            },
          },
        ],
      },
    ],
  },
]
