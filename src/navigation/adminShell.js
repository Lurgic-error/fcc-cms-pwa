import {
  faBookOpen,
  faBriefcase,
  faBuilding,
  faBuildingColumns,
  faChartLine,
  faClipboardCheck,
  faComments,
  faFolderOpen,
  faGaugeHigh,
  faGlobe,
  faRoute,
  faUsers,
} from '@/plugins/fontAwesome'

const SECTION_BLUEPRINT = Object.freeze([
  {
    id: 'primary',
    title: '',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        description: 'Overview, analytics, and summary views.',
        icon: faGaugeHigh,
        routeNames: ['dashboard.overview', 'dashboard.analytics', 'dashboard.summary'],
        matchRoutes: ['dashboard.'],
      },
      {
        id: 'visitor-analytics',
        label: 'Visitor Analytics',
        description: 'Traffic, behaviour, and heatmap insights.',
        icon: faChartLine,
        routeNames: ['visitors.analytics', 'visitors.list', 'visitors.heatmap'],
        matchRoutes: ['visitors.'],
      },
      {
        id: 'workflow-approval',
        label: 'Workflow Approval',
        description: 'Editorial review queues and workflow monitoring.',
        icon: faClipboardCheck,
        routeNames: [
          'publications.reviewQueue',
          'publicationCategories.reviewQueue',
          'events.reviewQueue',
          'questions.reviewQueue',
          'videos.reviewQueue',
          'system.workflowMonitor',
        ],
        matchRoutes: [
          'publications.reviewQueue',
          'publicationCategories.reviewQueue',
          'events.reviewQueue',
          'questions.reviewQueue',
          'videos.reviewQueue',
          'system.workflowMonitor',
        ],
        badgeMode: 'routes-count',
      },
    ],
  },
  {
    id: 'institutional',
    title: 'Institutional',
    items: [
      {
        id: 'governance',
        label: 'Governance',
        description: 'The Commission, Commissioners, and Committees.',
        icon: faBuildingColumns,
        routeNames: ['commission.details', 'commissioners.list', 'committees.list'],
        matchRoutes: ['commission.', 'commissioners.', 'committees.'],
        children: [
          { id: 'commission', label: 'The Commission', routeName: 'commission.details' },
          { id: 'commissioners', label: 'Commissioners', routeName: 'commissioners.list' },
          { id: 'committees', label: 'Committees', routeName: 'committees.list' },
        ],
      },
      {
        id: 'structure',
        label: 'Structure',
        description: 'Directorates, sections, units, and offices.',
        icon: faBuilding,
        routeNames: ['directorates.list', 'sections.list', 'units.list', 'offices.list'],
        matchRoutes: ['directorates.', 'sections.', 'units.', 'offices.'],
        children: [
          { id: 'directorates', label: 'Directorates', routeName: 'directorates.list' },
          { id: 'sections', label: 'Sections', routeName: 'sections.list' },
          { id: 'units', label: 'Units', routeName: 'units.list' },
          { id: 'offices', label: 'Offices', routeName: 'offices.list' },
        ],
      },
      {
        id: 'public-services',
        label: 'Public Services',
        description: 'Public service management.',
        icon: faBriefcase,
        routeNames: ['services.list'],
        matchRoutes: ['services.'],
      },
    ],
  },
  {
    id: 'communication',
    title: 'Communication',
    items: [
      {
        id: 'press-media',
        label: 'Press & Media',
        description: 'Events, articles, photos, and videos.',
        icon: faGlobe,
        routeNames: ['events.list', 'articles.list', 'photos.list', 'videos.list'],
        matchRoutes: ['events.', 'articles.', 'photos.', 'videos.'],
        children: [
          { id: 'events-calendar', label: 'Events Calendar', routeName: 'events.list' },
          { id: 'articles-news', label: 'Articles & News', routeName: 'articles.list' },
          { id: 'photo-gallery', label: 'Photo Gallery', routeName: 'photos.list' },
          { id: 'video-library', label: 'Video Library', routeName: 'videos.list' },
        ],
      },
      {
        id: 'library',
        label: 'Library',
        description: 'Publications, categories, and FAQs.',
        icon: faBookOpen,
        routeNames: ['publications.list', 'publicationCategories.list', 'questions.list'],
        matchRoutes: ['publications.', 'publicationCategories.', 'questions.'],
        children: [
          { id: 'publications', label: 'Publications', routeName: 'publications.list' },
          {
            id: 'resource-categories',
            label: 'Resource Categories',
            routeName: 'publicationCategories.list',
          },
          { id: 'faqs', label: 'Frequently Asked FAQs', routeName: 'questions.list' },
        ],
      },
      {
        id: 'engagement',
        label: 'Engagement',
        description: 'Inquiries, subscribers, and social media.',
        icon: faComments,
        routeNames: ['inquiries.list', 'subscribers.list', 'socials.list'],
        matchRoutes: ['inquiries.', 'subscribers.', 'socials.', 'partners.'],
        children: [
          { id: 'inquiries', label: 'Inquiries', routeName: 'inquiries.list' },
          {
            id: 'newsletter-subscribers',
            label: 'Newsletter Subscribers',
            routeName: 'subscribers.list',
          },
          { id: 'social-media', label: 'Social Media', routeName: 'socials.list' },
        ],
      },
    ],
  },
  {
    id: 'system-admin',
    title: 'System Admin',
    items: [
      {
        id: 'asset-management',
        label: 'Asset Management',
        description: 'Library operations and uploads.',
        icon: faFolderOpen,
        routeNames: ['assets.library', 'assets.upload', 'assets.archive'],
        matchRoutes: ['assets.'],
      },
      {
        id: 'users-roles',
        label: 'Users & Roles',
        description: 'Identity management and access control.',
        icon: faUsers,
        routeNames: ['users.list', 'roles.list'],
        matchRoutes: ['users.', 'roles.'],
        children: [
          { id: 'identity-management', label: 'Identity Management', routeName: 'users.list' },
          { id: 'access-control', label: 'Access Control', routeName: 'roles.list' },
        ],
      },
      {
        id: 'audit-trail',
        label: 'Audit Trail',
        description: 'Audit and activity logs.',
        icon: faRoute,
        routeNames: ['system.auditTrail', 'system.activityLog'],
        matchRoutes: ['system.auditTrail', 'system.activityLog'],
      },
    ],
  },
])

function mergeMeta(parentMeta = {}, routeMeta = {}) {
  return {
    ...parentMeta,
    ...routeMeta,
    nav: {
      ...(parentMeta.nav || {}),
      ...(routeMeta.nav || {}),
    },
    page: {
      ...(parentMeta.page || {}),
      ...(routeMeta.page || {}),
    },
    breadcrumb: {
      ...(parentMeta.breadcrumb || {}),
      ...(routeMeta.breadcrumb || {}),
    },
    roles: routeMeta.roles ?? parentMeta.roles,
    permissions: routeMeta.permissions ?? parentMeta.permissions,
    requiresAuth: routeMeta.requiresAuth ?? parentMeta.requiresAuth ?? false,
  }
}

function buildRouteMetaIndex(routes = [], parentMeta = {}, map = new Map()) {
  for (const route of routes) {
    const mergedMeta = mergeMeta(parentMeta, route.meta || {})

    if (route.name) {
      map.set(route.name, mergedMeta)
    }

    if (Array.isArray(route.children) && route.children.length > 0) {
      buildRouteMetaIndex(route.children, mergedMeta, map)
    }
  }

  return map
}

function dedupe(values = []) {
  return [...new Set(values.filter(Boolean))]
}

function isRouteAccessible(routeName, routeMetaIndex, canAccess) {
  const routeMeta = routeMetaIndex.get(routeName)
  if (!routeMeta) return false
  return canAccess(routeMeta)
}

function mapNavigationNode(node, routeMetaIndex, canAccess) {
  const children = (node.children || [])
    .map((child) => mapNavigationNode(child, routeMetaIndex, canAccess))
    .filter(Boolean)

  const routeCandidates = dedupe([...(node.routeNames || []), node.routeName])
  const accessibleRoutes = routeCandidates.filter((routeName) =>
    isRouteAccessible(routeName, routeMetaIndex, canAccess),
  )

  const primaryRouteName = accessibleRoutes[0] || children[0]?.routeName || null

  if (!primaryRouteName && children.length === 0) {
    return null
  }

  return {
    id: node.id,
    label: node.label,
    description: node.description || '',
    icon: node.icon || null,
    routeName: primaryRouteName,
    matchRoutes: dedupe([
      ...(node.matchRoutes || []),
      ...routeCandidates,
      ...children.flatMap((child) => child.matchRoutes || [child.routeName]),
    ]),
    badge:
      node.badgeMode === 'routes-count'
        ? accessibleRoutes.length > 0
          ? String(accessibleRoutes.length)
          : null
        : node.badgeMode === 'children-count'
          ? children.length > 0
            ? String(children.length)
            : null
          : node.badge || null,
    defaultOpen: Boolean(node.defaultOpen),
    children,
  }
}

export function buildAdminShellNavigation(routes = [], options = {}) {
  const { canAccess = () => true } = options
  const routeMetaIndex = buildRouteMetaIndex(routes)

  return SECTION_BLUEPRINT.map((section) => ({
    id: section.id,
    title: section.title,
    items: section.items
      .map((item) => mapNavigationNode(item, routeMetaIndex, canAccess))
      .filter(Boolean),
  })).filter((section) => section.items.length > 0)
}

export function flattenAdminShellNavigation(sections = []) {
  const results = []
  const seen = new Set()

  for (const section of sections) {
    for (const item of section.items) {
      if (item.routeName && !seen.has(item.routeName)) {
        results.push({
          routeName: item.routeName,
          label: item.label,
          description: item.description,
          sectionTitle: section.title || 'Navigation',
          parentLabel: item.label,
          icon: item.icon,
        })
        seen.add(item.routeName)
      }

      for (const child of item.children || []) {
        if (!child.routeName || seen.has(child.routeName)) continue

        results.push({
          routeName: child.routeName,
          label: child.label,
          description: item.description,
          sectionTitle: section.title || 'Navigation',
          parentLabel: item.label,
          icon: item.icon,
        })
        seen.add(child.routeName)
      }
    }
  }

  return results
}
