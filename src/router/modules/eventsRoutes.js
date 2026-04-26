import { NAV_SECTIONS } from '@/navigation/navSections'
import { PERMISSIONS, ROLES } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requirePermission } from '@/router/middleware'

export default [
  {
    path: '/events',
    component: CmsLayout,
    meta: {
      ...requireAuth,

      nav: {
        section: NAV_SECTIONS.CONTENT,
        label: 'Events',
        i18nKey: 'nav.events',
        icon: 'mdi-calendar',
        order: 1,
      },

      breadcrumb: {
        label: 'Events',
        i18nKey: 'breadcrumbs.events',
      },

      page: {
        title: 'Events',
        i18nKey: 'pages.events.root',
      },
    },
    children: [
      /* =========================
       * LIST & CREATE
       * ========================= */
      {
        path: '',
        name: 'events.list',
        component: () => import('@/pages/events/EventsListPage.vue'),
        meta: {
          type: 'list',
          page: {
            title: 'Events',
            i18nKey: 'pages.events.list',
          },
          breadcrumb: {
            label: 'List',
            i18nKey: 'breadcrumbs.list',
          },
        },
      },
      {
        path: 'create',
        name: 'events.create',
        component: () => import('@/pages/events/EventCreatePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.CREATE]),
          roles: [ROLES.PUBLISHER, ROLES.EDITOR],

          type: 'create',
          page: {
            title: 'Create Event',
            i18nKey: 'pages.events.create',
          },
          breadcrumb: {
            label: 'Create',
            i18nKey: 'breadcrumbs.create',
          },
        },
      },

      /* =========================
       * WORKFLOW & ARCHIVE
       * ========================= */
      {
        path: 'review-queue',
        name: 'events.reviewQueue',
        component: () => import('@/pages/events/EventReviewQueuePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.REVIEW]),
          roles: [ROLES.REVIEWER, ROLES.PUBLISHER],

          type: 'workflow',
          page: {
            title: 'Review Queue',
            i18nKey: 'pages.events.reviewQueue',
          },
          breadcrumb: {
            label: 'Review Queue',
            i18nKey: 'breadcrumbs.reviewQueue',
          },
          workflow: {
            entity: 'event',
            transition: 'review',
          },
        },
      },
      {
        path: 'archive',
        name: 'events.archive',
        component: () => import('@/pages/events/EventArchivePage.vue'),
        meta: {
          ...requirePermission([PERMISSIONS.ARCHIVE]),
          roles: [ROLES.PUBLISHER],

          type: 'archive',
          page: {
            title: 'Archived Events',
            i18nKey: 'pages.events.archive',
          },
          breadcrumb: {
            label: 'Archive',
            i18nKey: 'breadcrumbs.archive',
          },
          workflow: {
            entity: 'event',
            transition: 'archive',
          },
        },
      },

      /* =========================
       * EVENT CONTEXT (PARENT)
       * ========================= */
      {
        path: ':eventId',
        meta: {
          breadcrumb: {
            dynamic: true,
            resolver: 'event',
            label: 'Event',
            i18nKey: 'breadcrumbs.event',
          },
          workflow: {
            entity: 'event',
          },
        },
        children: [
          /* ---------- DETAILS ---------- */
          {
            path: '',
            name: 'events.details',
            component: () => import('@/pages/events/EventDetailsPage.vue'),
            meta: {
              type: 'details',
              page: {
                title: 'Event Details',
                i18nKey: 'pages.events.details',
              },
              breadcrumb: {
                label: 'Details',
                i18nKey: 'breadcrumbs.details',
              },
            },
          },

          /* ---------- EDIT ---------- */
          {
            path: 'edit',
            name: 'events.edit',
            component: () => import('@/pages/events/EventEditPage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.UPDATE]),
              roles: [ROLES.PUBLISHER, ROLES.EDITOR],

              type: 'edit',
              page: {
                title: 'Edit Event',
                i18nKey: 'pages.events.edit',
              },
              breadcrumb: {
                label: 'Edit',
                i18nKey: 'breadcrumbs.edit',
              },

              workflow: {
                entity: 'event',
                transition: 'edit',
                allowedStates: ['draft', 'rejected'],
              },
            },
          },

          /* ---------- SCHEDULE ---------- */
          {
            path: 'schedule',
            name: 'events.schedule',
            component: () => import('@/pages/events/EventSchedulePage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.PUBLISH]),
              roles: [ROLES.PUBLISHER],

              type: 'workflow',
              page: {
                title: 'Schedule Event',
                i18nKey: 'pages.events.schedule',
              },
              breadcrumb: {
                label: 'Schedule',
                i18nKey: 'breadcrumbs.schedule',
              },

              workflow: {
                entity: 'event',
                transition: 'schedule',
                allowedStates: ['approved', 'published', 'scheduled', 'unpublished'],
              },
            },
          },

          /* ---------- HISTORY ---------- */
          {
            path: 'history',
            name: 'events.history',
            component: () => import('@/pages/events/EventHistoryPage.vue'),
            meta: {
              ...requirePermission([PERMISSIONS.UPDATE]),
              roles: [ROLES.PUBLISHER, ROLES.EDITOR, ROLES.REVIEWER],

              type: 'history',
              page: {
                title: 'Event History',
                i18nKey: 'pages.events.history',
              },
              breadcrumb: {
                label: 'History',
                i18nKey: 'breadcrumbs.history',
              },
            },
          },
        ],
      },
    ],
  },
]
