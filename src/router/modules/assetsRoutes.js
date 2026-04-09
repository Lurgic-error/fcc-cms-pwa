import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/assets',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.ASSETS,
        label: 'Assets',
        i18nKey: 'nav.assets',
        icon: 'mdi-folder-multiple-image',
        order: 1,
      },

      breadcrumb: {
        label: 'Assets',
        i18nKey: 'breadcrumbs.assets',
      },
    },
    children: [
      {
        path: '',
        name: 'assets.library',
        component: () => import('@/pages/assets/AssetsLibraryPage.vue'),
        meta: {
          page: {
            title: 'Assets Library',
            i18nKey: 'pages.assets.library',
          },
          breadcrumb: {
            label: 'Library',
            i18nKey: 'breadcrumbs.library',
          },
          type: 'list',
        },
      },
      {
        path: 'upload',
        name: 'assets.upload',
        component: () => import('@/pages/assets/AssetUploadPage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.CREATE]),
          page: {
            title: 'Upload Asset',
            i18nKey: 'pages.assets.upload',
          },
          breadcrumb: {
            label: 'Upload',
            i18nKey: 'breadcrumbs.upload',
          },
          type: 'create',
        },
      },
      {
        path: 'archive',
        name: 'assets.archive',
        component: () => import('@/pages/assets/AssetArchivePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.ARCHIVE]),
          page: {
            title: 'Archived Assets',
            i18nKey: 'pages.assets.archive',
          },
          breadcrumb: {
            label: 'Archive',
            i18nKey: 'breadcrumbs.archive',
          },
          type: 'archive',
        },
      },
      {
        path: ':assetId',
        meta: {
          breadcrumb: {
            dynamic: true,
            resolver: 'asset', // resolved via assets store
          },
        },
        children: [
          {
            path: '',
            name: 'assets.details',
            component: () => import('@/pages/assets/AssetDetailsPage.vue'),
            meta: {
              page: {
                title: 'Asset Details',
                i18nKey: 'pages.assets.details',
              },
              type: 'details',
            },
          },
          {
            path: 'usage',
            name: 'assets.usage',
            component: () => import('@/pages/assets/AssetUsagePage.vue'),
            meta: {
              page: {
                title: 'Asset Usage',
                i18nKey: 'pages.assets.usage',
              },
              breadcrumb: {
                label: 'Usage',
                i18nKey: 'breadcrumbs.usage',
              },
              type: 'usage',
            },
          },
        ],
      },
    ],
  },
]
