function joinPaths(parentPath = '', childPath = '') {
  const p = (parentPath || '').replace(/\/+$/, '')
  const c = (childPath || '').replace(/^\/+/, '')

  if (!p && !c) return '/'
  if (!p) return `/${c}`
  if (!c) return p.startsWith('/') ? p : `/${p}`
  return `${p.startsWith('/') ? p : `/${p}`}/${c}`
}

export function flattenedRoutes(routes = [], parent = null) {
  const out = []

  for (const route of routes) {
    const fullPath = parent ? joinPaths(parent.path, route.path) : route.path || '/'

    const normalized = {
      ...route,
      path: fullPath,
      meta: route.meta || {},
    }

    // keep parent pointer for breadcrumb building / debugging (non-router standard, but safe for our utilities)
    normalized.__parent = parent ? { name: parent.name, path: parent.path } : null

    out.push(normalized)

    if (Array.isArray(route.children) && route.children.length > 0) {
      out.push(...flattenedRoutes(route.children, normalized))
    }
  }

  return out
}
