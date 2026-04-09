export function extractNavRoutes(routes) {
  return routes.filter((route) => route.meta?.nav && route.name && !route.meta?.nav?.hidden)
}
