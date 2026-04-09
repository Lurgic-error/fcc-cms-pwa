import { NAV_SECTIONS } from './navSections'

function defaultCanAccess() {
  return true
}

function normalizeSections() {
  return Object.values(NAV_SECTIONS).map((sectionKey) => ({
    section: sectionKey,
    items: [],
  }))
}

function resolveRouteName(route) {
  if (!route) return null
  if (route.name) return route.name

  const redirectName =
    typeof route.redirect === 'object' && route.redirect ? route.redirect.name : null
  if (redirectName) return redirectName

  if (!Array.isArray(route.children)) return null

  for (const child of route.children) {
    const name = resolveRouteName(child)
    if (name) return name
  }

  return null
}

function collectNavEntries(routes = [], canAccess = defaultCanAccess) {
  const entries = []

  for (const route of routes) {
    const meta = route.meta || {}
    const nav = meta.nav

    if (nav && nav.visible !== false && canAccess(meta)) {
      const routeName = resolveRouteName(route)

      if (routeName) {
        entries.push({
          section: nav.section,
          label: nav.label,
          i18nKey: nav.i18nKey,
          icon: nav.icon,
          order: nav.order ?? 999,
          routeName,
          badge: nav.badge,
          description: nav.description,
        })
      }
    }

    if (Array.isArray(route.children) && route.children.length > 0) {
      entries.push(...collectNavEntries(route.children, canAccess))
    }
  }

  return entries
}

export function buildNavigation(routes = [], options = {}) {
  const { canAccess = defaultCanAccess, includeEmptySections = false } = options

  const sections = normalizeSections()
  const bySection = new Map(sections.map((s) => [s.section, s]))
  const entries = collectNavEntries(routes, canAccess)

  for (const entry of entries) {
    const group = bySection.get(entry.section)
    if (!group) continue

    group.items.push(entry)
  }

  // sort items per section
  for (const group of sections) {
    group.items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
  }

  const cleaned = includeEmptySections ? sections : sections.filter((s) => s.items.length > 0)

  return Object.freeze({
    sidebar: cleaned,
    topNav: [],
    footer: [],
  })
}
