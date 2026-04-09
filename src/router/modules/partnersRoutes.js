import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/partners',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.COMMUNICATION,
        label: 'Partners',
        i18nKey: 'nav.partners',
        icon: 'mdi-handshake',
        order: 3,
      },

      breadcrumb: {
        label: 'Partners',
        i18nKey: 'breadcrumbs.partners',
      },

      page: {
        title: 'Partners',
        i18nKey: 'pages.partners.root',
      },
    },
    children: [
      {
        path: '',
        name: 'partners.list',
        component: () => import('@/pages/partners/PartnersListPage.vue'),
        meta: {
          type: 'list',
          page: {
            title: 'Partners',
            i18nKey: 'pages.partners.list',
          },
          breadcrumb: {
            label: 'List',
            i18nKey: 'breadcrumbs.list',
          },
        },
      },
      {
        path: 'create',
        name: 'partners.create',
        component: () => import('@/pages/partners/PartnerCreatePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.CREATE]),
          type: 'create',
          page: {
            title: 'Create Partner',
            i18nKey: 'pages.partners.create',
          },
          breadcrumb: {
            label: 'Create',
            i18nKey: 'breadcrumbs.create',
          },
        },
      },
      {
        path: ':partnerId',
        meta: {
          breadcrumb: {
            dynamic: true,
            resolver: 'partner',
            label: 'Partner',
            i18nKey: 'breadcrumbs.partner',
          },
        },
        children: [
          {
            path: '',
            name: 'partners.details',
            component: () => import('@/pages/partners/PartnerDetailsPage.vue'),
            meta: {
              type: 'details',
              page: {
                title: 'Partner Details',
                i18nKey: 'pages.partners.details',
              },
              breadcrumb: {
                label: 'Details',
                i18nKey: 'breadcrumbs.details',
              },
            },
          },
          {
            path: 'edit',
            name: 'partners.edit',
            component: () => import('@/pages/partners/PartnerEditPage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.UPDATE]),
              type: 'edit',
              page: {
                title: 'Edit Partner',
                i18nKey: 'pages.partners.edit',
              },
              breadcrumb: {
                label: 'Edit',
                i18nKey: 'breadcrumbs.edit',
              },
            },
          },
        ],
      },
    ],
  },
]
