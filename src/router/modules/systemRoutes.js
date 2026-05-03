import { NAV_SECTIONS } from '@/navigation/navSections'
import { ROLES } from '@/router/constants'
import CmsLayout from '@/router/layouts/CmsLayout.vue'
import { requireAuth, requireRole } from '@/router/middleware'

export default [
  {
    path: '/system',
    component: CmsLayout,
    meta: {
      ...requireAuth,
      ...requireRole([ROLES.PUBLISHER]),

      nav: {
        section: NAV_SECTIONS.SYSTEM,
        label: 'System',
        i18nKey: 'nav.system',
        icon: 'mdi-cog',
        order: 99,
        visible: false,
      },

      breadcrumb: {
        label: 'System',
        i18nKey: 'breadcrumbs.system',
      },

      page: {
        title: 'System',
        i18nKey: 'pages.system.root',
      },
    },
    children: [
      {
        path: 'activity-log',
        name: 'system.activityLog',
        component: () => import('@/pages/system/ActivityLogPage.vue'),
        meta: {
          type: 'audit',
          breadcrumb: {
            label: 'Activity Log',
            i18nKey: 'breadcrumbs.activityLog',
          },
        },
      },
      {
        path: 'audit',
        name: 'system.audit',
        component: () => import('@/pages/system/AuditTrailPage.vue'),
        meta: {
          type: 'audit',
          breadcrumb: {
            label: 'Audit',
            i18nKey: 'breadcrumbs.audit',
          },
        },
      },
      {
        path: 'audit/users/:userId?',
        name: 'system.auditUsers',
        component: () => import('@/pages/system/AuditTrailPage.vue'),
        meta: {
          type: 'audit',
          auditPreset: 'users',
          breadcrumb: {
            label: 'User Audit',
            i18nKey: 'breadcrumbs.userAudit',
          },
        },
      },
      {
        path: 'audit/resources/:resourceType?/:resourceId?',
        name: 'system.auditResources',
        component: () => import('@/pages/system/AuditTrailPage.vue'),
        meta: {
          type: 'audit',
          auditPreset: 'resources',
          breadcrumb: {
            label: 'Resource Audit',
            i18nKey: 'breadcrumbs.resourceAudit',
          },
        },
      },
      {
        path: 'audit/actions/:action?',
        name: 'system.auditActions',
        component: () => import('@/pages/system/AuditTrailPage.vue'),
        meta: {
          type: 'audit',
          auditPreset: 'actions',
          breadcrumb: {
            label: 'Action Audit',
            i18nKey: 'breadcrumbs.actionAudit',
          },
        },
      },
      {
        path: 'audit-trail',
        name: 'system.auditTrail',
        component: () => import('@/pages/system/AuditTrailPage.vue'),
        meta: {
          type: 'audit',
          breadcrumb: {
            label: 'Audit Trail',
            i18nKey: 'breadcrumbs.auditTrail',
          },
        },
      },
      {
        path: 'workflow-monitor',
        name: 'system.workflowMonitor',
        component: () => import('@/pages/system/WorkflowMonitorPage.vue'),
        meta: {
          type: 'workflow',
          breadcrumb: {
            label: 'Workflow Monitor',
            i18nKey: 'breadcrumbs.workflowMonitor',
          },
        },
      },
      {
        path: 'scheduled-jobs',
        name: 'system.scheduledJobs',
        component: () => import('@/pages/system/ScheduledJobsPage.vue'),
        meta: {
          type: 'system',
          breadcrumb: {
            label: 'Scheduled Jobs',
            i18nKey: 'breadcrumbs.scheduledJobs',
          },
        },
      },
      {
        path: 'settings',
        name: 'system.settings',
        component: () => import('@/pages/system/SettingsPage.vue'),
        meta: {
          type: 'settings',
          breadcrumb: {
            label: 'Settings',
            i18nKey: 'breadcrumbs.settings',
          },
        },
      },
    ],
  },
]
