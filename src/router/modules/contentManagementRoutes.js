import { NAV_SECTIONS } from '@/navigation/navSections'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth } from '@/router/middleware'

export default [
  {
    path: '/content-management',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.CONTENT,
        label: 'Content Management',
        i18nKey: 'nav.contentManagement',
        icon: 'mdi-view-dashboard-edit-outline',
        order: 1,
      },

      breadcrumb: {
        label: 'Content Management',
        i18nKey: 'breadcrumbs.contentManagement',
      },

      page: {
        title: 'Content Management',
        i18nKey: 'pages.contentManagement.root',
      },
    },
    children: [
      {
        path: '',
        name: 'contentManagement.overview',
        component: () => import('@/pages/contentManagement/ContentManagementOverviewPage.vue'),
        meta: {
          type: 'overview',
          breadcrumb: { label: 'Overview', i18nKey: 'breadcrumbs.overview' },
          page: { title: 'Content Management', i18nKey: 'pages.contentManagement.overview' },
        },
      },
      {
        path: 'locales',
        name: 'contentManagement.locales',
        component: () => import('@/pages/contentManagement/LocalesPage.vue'),
        meta: {
          type: 'list',
          breadcrumb: { label: 'Locales', i18nKey: 'breadcrumbs.locales' },
          page: { title: 'Locales', i18nKey: 'pages.contentManagement.locales' },
        },
      },
      {
        path: 'block-types',
        name: 'contentManagement.blockTypes',
        component: () => import('@/pages/contentManagement/BlockTypesPage.vue'),
        meta: {
          type: 'list',
          breadcrumb: { label: 'Block Types', i18nKey: 'breadcrumbs.blockTypes' },
          page: { title: 'Block Types', i18nKey: 'pages.contentManagement.blockTypes' },
        },
      },
      {
        path: 'layouts',
        name: 'contentManagement.layouts',
        component: () => import('@/pages/contentManagement/LayoutsPage.vue'),
        meta: {
          type: 'list',
          breadcrumb: { label: 'Layouts', i18nKey: 'breadcrumbs.layouts' },
          page: { title: 'Layouts', i18nKey: 'pages.contentManagement.layouts' },
        },
      },
      {
        path: 'pages',
        name: 'contentManagement.pages',
        component: () => import('@/pages/contentManagement/PagesManagementPage.vue'),
        meta: {
          type: 'list',
          breadcrumb: { label: 'Pages', i18nKey: 'breadcrumbs.pages' },
          page: { title: 'Pages', i18nKey: 'pages.contentManagement.pages' },
        },
      },
      {
        path: 'content-items',
        name: 'contentManagement.contentItems',
        component: () => import('@/pages/contentManagement/ContentItemsPage.vue'),
        meta: {
          type: 'list',
          breadcrumb: { label: 'Content Items', i18nKey: 'breadcrumbs.contentItems' },
          page: { title: 'Content Items', i18nKey: 'pages.contentManagement.contentItems' },
        },
      },
      {
        path: 'content-versions',
        name: 'contentManagement.contentVersions',
        component: () => import('@/pages/contentManagement/ContentVersionsPage.vue'),
        meta: {
          type: 'list',
          breadcrumb: { label: 'Content Versions', i18nKey: 'breadcrumbs.contentVersions' },
          page: { title: 'Content Versions', i18nKey: 'pages.contentManagement.contentVersions' },
        },
      },
      {
        path: 'placements',
        name: 'contentManagement.placements',
        component: () => import('@/pages/contentManagement/PlacementsPage.vue'),
        meta: {
          type: 'list',
          breadcrumb: { label: 'Placements', i18nKey: 'breadcrumbs.placements' },
          page: { title: 'Placements', i18nKey: 'pages.contentManagement.placements' },
        },
      },
    ],
  },
]
