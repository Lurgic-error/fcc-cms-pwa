import { NAV_SECTIONS } from '@/navigation/navSections'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth } from '@/router/middleware'

export default [
  {
    path: '/public-notices',
    component: CmsLayout,
    meta: {
      ...requireAuth,
      nav: {
        section: NAV_SECTIONS.CONTENT,
        label: 'Public Notices',
        icon: 'mdi-bullhorn-outline',
        order: 4,
        visible: false,
      },
      breadcrumb: { label: 'Public Notices' },
      page: { title: 'Public Notices' },
    },
    children: [
      {
        path: ':noticeId/schedule',
        name: 'publicNotices.schedule',
        redirect: (to) => ({
          name: 'publications.schedule',
          params: { publicationId: to.params.noticeId },
        }),
      },
    ],
  },
]
