import { NAV_SECTIONS } from '@/navigation/navSections'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth } from '@/router/middleware'

export default [
  {
    path: '/visitors',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.SYSTEM,
        label: 'Visitors',
        i18nKey: 'nav.visitors',
        icon: 'mdi-chart-bar',
        order: 60,
      },

      breadcrumb: {
        label: 'Visitors',
        i18nKey: 'breadcrumbs.visitors',
      },

      page: {
        title: 'Visitors',
        i18nKey: 'pages.visitors.list',
      },
    },
    children: [
      {
        path: '',
        name: 'visitors.list',
        component: () => import('@/pages/visitors/VisitorsListPage.vue'),
      },
      {
        path: 'analytics',
        name: 'visitors.analytics',
        component: () => import('@/pages/visitors/VisitorAnalyticsPage.vue'),
        meta: {
          breadcrumb: {
            label: 'Analytics',
            i18nKey: 'breadcrumbs.visitors.analytics',
          },
        },
      },
      {
        path: 'heatmap',
        name: 'visitors.heatmap',
        component: () => import('@/pages/visitors/VisitorHeatmapPage.vue'),
        meta: {
          type: 'heatmap',
          breadcrumb: {
            label: 'Heatmap',
            i18nKey: 'breadcrumbs.visitors.heatmap',
          },
        },
      },
    ],
  },
]
