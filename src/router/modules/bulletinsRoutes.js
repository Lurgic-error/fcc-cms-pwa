import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS, ROLES } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/bulletins',
    component: CmsLayout,
    meta: {
      ...requireAuth,
      nav: {
        section: NAV_SECTIONS.CONTENT,
        label: 'Bulletins',
        icon: 'mdi-file-document-outline',
        order: 5,
        visible: false,
      },
      breadcrumb: { label: 'Bulletins' },
      page: { title: 'Bulletins' },
    },
    children: [
      {
        path: ':bulletinId/schedule',
        name: 'bulletins.schedule',
        redirect: (to) => ({
          name: 'articles.schedule',
          params: { articleId: to.params.bulletinId },
        }),
        meta: {
          ...requirePermission([PERMISSIONS.PUBLISH]),
          roles: [ROLES.PUBLISHER, ROLES.ADMIN],
          type: 'schedule',
          breadcrumb: { label: 'Article Schedule', i18nKey: 'breadcrumbs.schedule' },
          page: { title: 'Article Schedule' },
        },
      },
    ],
  },
]
