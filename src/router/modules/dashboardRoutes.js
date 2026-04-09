import { NAV_SECTIONS } from '@/navigation/navSections'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth } from '@/router/middleware'

export default [
  {
    path: '/dashboard',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.DASHBOARD,
        label: 'Dashboard',
        i18nKey: 'nav.dashboard',
        icon: 'mdi-view-dashboard',
        order: 1,
      },

      breadcrumb: {
        label: 'Dashboard',
        i18nKey: 'breadcrumbs.dashboard',
      },

      page: {
        title: 'Dashboard',
        i18nKey: 'pages.dashboard.root',
      },
    },
    children: [
      {
        path: '',
        name: 'dashboard.overview',
        component: () => import('@/pages/dashboard/OverviewPage.vue'),
        meta: {
          type: 'system',
          page: {
            title: 'Overview',
            i18nKey: 'pages.dashboard.overview',
          },
          breadcrumb: {
            label: 'Overview',
            i18nKey: 'breadcrumbs.overview',
          },
        },
      },
      {
        path: 'analytics',
        name: 'dashboard.analytics',
        component: () => import('@/pages/dashboard/AnalyticsPage.vue'),
        meta: {
          type: 'system',
          page: {
            title: 'Analytics',
            i18nKey: 'pages.dashboard.analytics',
          },
          breadcrumb: {
            label: 'Analytics',
            i18nKey: 'breadcrumbs.analytics',
          },
        },
      },
      {
        path: 'summary',
        name: 'dashboard.summary',
        component: () => import('@/pages/dashboard/DashboardPage.vue'),
        meta: {
          type: 'system',
          page: {
            title: 'Summary',
            i18nKey: 'pages.dashboard.summary',
          },
          breadcrumb: {
            label: 'Summary',
            i18nKey: 'breadcrumbs.summary',
          },
        },
      },
    ],
  },
]
