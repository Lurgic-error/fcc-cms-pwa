import { NAV_SECTIONS } from '@/navigation/navSections'
import { ROLES } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requireRole } from '@/router/middleware'

export default [
  {
    path: '/roles',
    component: CmsLayout,
    meta: {
      ...requireAuth,
      ...requireRole([ROLES.PUBLISHER]),

      nav: {
        section: NAV_SECTIONS.USERS,
        label: 'Roles & Permissions',
        i18nKey: 'nav.roles',
        icon: 'mdi-shield-account',
        order: 2,
      },

      breadcrumb: {
        label: 'Roles',
        i18nKey: 'breadcrumbs.roles',
      },

      page: {
        title: 'Roles & Permissions',
        i18nKey: 'pages.roles.root',
      },
    },
    children: [
      /* ================= LIST ================= */
      {
        path: '',
        name: 'roles.list',
        component: () => import('@/pages/roles/RolesListPage.vue'),
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
        name: 'roles.create',
        component: () => import('@/pages/roles/RoleCreatePage.vue'),
        meta: {
          type: 'create',
          breadcrumb: {
            label: 'Create',
            i18nKey: 'breadcrumbs.create',
          },
        },
      },

      /* ================= ROLE CONTEXT ================= */
      {
        path: ':roleId',
        meta: {
          breadcrumb: {
            dynamic: true,
            resolver: 'role',
            label: 'Role',
            i18nKey: 'breadcrumbs.role',
          },
        },
        children: [
          {
            path: '',
            name: 'roles.details',
            component: () => import('@/pages/roles/RoleDetailsPage.vue'),
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
            name: 'roles.edit',
            component: () => import('@/pages/roles/RoleEditPage.vue'),
            meta: {
              type: 'edit',
              breadcrumb: {
                label: 'Edit',
                i18nKey: 'breadcrumbs.edit',
              },
            },
          },
          {
            path: 'permissions',
            name: 'roles.permissions',
            component: () => import('@/pages/roles/RolePermissionsPage.vue'),
            meta: {
              type: 'management',
              breadcrumb: {
                label: 'Permissions',
                i18nKey: 'breadcrumbs.permissions',
              },
            },
          },
          {
            path: 'assignments',
            name: 'roles.assignments',
            component: () => import('@/pages/roles/RoleAssignmentsPage.vue'),
            meta: {
              type: 'management',
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
