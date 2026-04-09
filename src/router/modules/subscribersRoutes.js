import { NAV_SECTIONS } from '@/navigation/navSections'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth } from '@/router/middleware'

export default [
  {
    path: '/subscribers',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.COMMUNICATION,
        label: 'Subscribers',
        i18nKey: 'nav.subscribers',
        icon: 'mdi-email-newsletter',
        order: 50,
      },

      breadcrumb: {
        label: 'Subscribers',
        i18nKey: 'breadcrumbs.subscribers',
      },

      page: {
        title: 'Subscribers',
        i18nKey: 'pages.subscribers.list',
      },
    },
    children: [
      {
        path: '',
        name: 'subscribers.list',
        component: () => import('@/pages/subscribers/SubscribersListPage.vue'),
        meta: {
          type: 'list',
          breadcrumb: {
            label: 'List',
            i18nKey: 'breadcrumbs.list',
          },
        },
      },
      {
        path: 'segments',
        name: 'subscribers.segments',
        component: () => import('@/pages/subscribers/SubscriberSegmentsPage.vue'),
        meta: {
          type: 'segments',
          breadcrumb: {
            label: 'Segments',
            i18nKey: 'breadcrumbs.segments',
          },
        },
      },
      {
        path: ':subscriberId',
        name: 'subscribers.details',
        component: () => import('@/pages/subscribers/SubscriberDetailsPage.vue'),
        meta: {
          type: 'details',
          breadcrumb: {
            label: 'Subscriber Details',
            i18nKey: 'breadcrumbs.subscribers.details',
            dynamic: true,
            resolver: 'subscriber',
          },
        },
      },
    ],
  },
]
