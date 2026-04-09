import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/photos',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.CONTENT,
        label: 'Photos',
        i18nKey: 'nav.photos',
        icon: 'mdi-image-multiple',
        order: 4,
      },

      breadcrumb: {
        label: 'Photos',
        i18nKey: 'breadcrumbs.photos',
      },

      page: {
        title: 'Photos',
        i18nKey: 'pages.photos.root',
      },
    },
    children: [
      {
        path: '',
        name: 'photos.list',
        component: () => import('@/pages/photos/PhotosListPage.vue'),
        meta: {
          type: 'list',
          page: {
            title: 'Photos',
            i18nKey: 'pages.photos.list',
          },
          breadcrumb: {
            label: 'List',
            i18nKey: 'breadcrumbs.list',
          },
        },
      },
      {
        path: 'upload',
        name: 'photos.upload',
        component: () => import('@/pages/photos/PhotoUploadPage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.CREATE]),
          type: 'upload',
          page: {
            title: 'Upload Photo',
            i18nKey: 'pages.photos.upload',
          },
          breadcrumb: {
            label: 'Upload',
            i18nKey: 'breadcrumbs.upload',
          },
        },
      },
      {
        path: 'archive',
        name: 'photos.archive',
        component: () => import('@/pages/photos/PhotoArchivePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.ARCHIVE]),
          type: 'archive',
          page: {
            title: 'Archived Photos',
            i18nKey: 'pages.photos.archive',
          },
          breadcrumb: {
            label: 'Archive',
            i18nKey: 'breadcrumbs.archive',
          },
        },
      },
      {
        path: ':photoId',
        meta: {
          breadcrumb: {
            dynamic: true,
            resolver: 'photo',
            label: 'Photo',
            i18nKey: 'breadcrumbs.photo',
          },
        },
        children: [
          {
            path: '',
            name: 'photos.details',
            component: () => import('@/pages/photos/PhotoDetailsPage.vue'),
            meta: {
              type: 'details',
              page: {
                title: 'Photo Details',
                i18nKey: 'pages.photos.details',
              },
              breadcrumb: {
                label: 'Details',
                i18nKey: 'breadcrumbs.details',
              },
            },
          },
          {
            path: 'edit',
            name: 'photos.edit',
            component: () => import('@/pages/photos/PhotoEditPage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.UPDATE]),
              type: 'edit',
              page: {
                title: 'Edit Photo',
                i18nKey: 'pages.photos.edit',
              },
              breadcrumb: {
                label: 'Edit',
                i18nKey: 'breadcrumbs.edit',
              },
            },
          },
          {
            path: 'usage',
            name: 'photos.usage',
            component: () => import('@/pages/photos/PhotoUsagePage.vue'),
            meta: {
              type: 'usage',
              page: {
                title: 'Photo Usage',
                i18nKey: 'pages.photos.usage',
              },
              breadcrumb: {
                label: 'Usage',
                i18nKey: 'breadcrumbs.usage',
              },
            },
          },
        ],
      },
    ],
  },
]
