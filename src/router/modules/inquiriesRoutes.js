import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/inquiries',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.COMMUNICATION,
        label: 'Inquiries',
        i18nKey: 'nav.inquiries',
        icon: 'mdi-email',
        order: 1,
      },

      breadcrumb: {
        label: 'Inquiries',
        i18nKey: 'breadcrumbs.inquiries',
      },

      page: {
        title: 'Inquiries',
        i18nKey: 'pages.inquiries.root',
      },
    },
    children: [
      {
        path: '',
        name: 'inquiries.list',
        component: () => import('@/pages/inquiries/InquiriesListPage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.UPDATE]),
          type: 'list',
          page: {
            title: 'Inquiries',
            i18nKey: 'pages.inquiries.list',
          },
          breadcrumb: {
            label: 'List',
            i18nKey: 'breadcrumbs.list',
          },
        },
      },
      {
        path: ':inquiryId',
        meta: {
          breadcrumb: {
            dynamic: true,
            resolver: 'inquiry',
            label: 'Inquiry',
            i18nKey: 'breadcrumbs.inquiry',
          },
        },
        children: [
          {
            path: '',
            name: 'inquiries.details',
            component: () => import('@/pages/inquiries/InquiryDetailsPage.vue'),
            meta: {
              type: 'details',
              page: {
                title: 'Inquiry Details',
                i18nKey: 'pages.inquiries.details',
              },
              breadcrumb: {
                label: 'Details',
                i18nKey: 'breadcrumbs.details',
              },
            },
          },
          {
            path: 'response',
            name: 'inquiries.response',
            component: () => import('@/pages/inquiries/InquiryResponsePage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.UPDATE]),
              type: 'response',
              page: {
                title: 'Respond to Inquiry',
                i18nKey: 'pages.inquiries.response',
              },
              breadcrumb: {
                label: 'Response',
                i18nKey: 'breadcrumbs.response',
              },
            },
          },
        ],
      },
    ],
  },
]
