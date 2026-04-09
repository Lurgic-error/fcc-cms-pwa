import { flattenedRoutes } from './flattenedRoutes'

export function extractBreadcrumbs(routes = []) {
  const source = Array.isArray(routes) ? routes : []
  const flat = flattenedRoutes(source)

  return flat
    .filter(
      (route) => route.name && route.meta?.breadcrumb && route.meta.breadcrumb.hidden !== true,
    )
    .map((route) => ({
      name: route.name,
      path: route.path,
      breadcrumb: route.meta.breadcrumb,
      page: route.meta.page,
      nav: route.meta.nav,
      type: route.meta.type,
      parent: route.__parent, // useful for debugging / tooling
    }))
}
