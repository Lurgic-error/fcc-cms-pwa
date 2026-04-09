import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/socials',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.COMMUNICATION,
        label: 'Social Media',
        i18nKey: 'nav.socials',
        icon: 'mdi-share-variant',
        order: 40,
      },

      breadcrumb: {
        label: 'Social Media',
        i18nKey: 'breadcrumbs.socials',
      },

      page: {
        title: 'Social Media Accounts',
        i18nKey: 'pages.socials.list',
      },
    },
    children: [
      {
        path: '',
        name: 'socials.list',
        component: () => import('@/pages/socials/SocialAccountsListPage.vue'),
      },
      {
        path: 'create',
        name: 'socials.create',
        component: () => import('@/pages/socials/SocialAccountCreatePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.CREATE]),
          breadcrumb: {
            label: 'Create Account',
            i18nKey: 'breadcrumbs.socials.create',
          },
        },
      },
      {
        path: 'publishing-rules',
        name: 'socials.rules',
        component: () => import('@/pages/socials/SocialPublishingRulesPage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.UPDATE]),
          breadcrumb: {
            label: 'Publishing Rules',
            i18nKey: 'breadcrumbs.socials.rules',
          },
        },
      },
      {
        path: ':socialId',
        children: [
          {
            path: '',
            name: 'socials.details',
            component: () => import('@/pages/socials/SocialAccountDetailsPage.vue'),
            meta: {
              breadcrumb: {
                label: 'Account Details',
                i18nKey: 'breadcrumbs.socials.details',
                dynamic: true,
                resolver: 'socialAccount',
              },
            },
          },
          {
            path: 'edit',
            name: 'socials.edit',
            component: () => import('@/pages/socials/SocialAccountEditPage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.UPDATE]),
              breadcrumb: {
                label: 'Edit Account',
                i18nKey: 'breadcrumbs.socials.edit',
              },
            },
          },
        ],
      },
    ],
  },
]
