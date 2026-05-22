import { createWebHashHistory, createWebHistory } from 'vue-router'

export function createRouterHistory({
  baseUrl = '/',
  routerMode = 'history',
  createWebHistory: makeWebHistory = createWebHistory,
  createWebHashHistory: makeHashHistory = createWebHashHistory,
} = {}) {
  return routerMode === 'hash' ? makeHashHistory(baseUrl) : makeWebHistory(baseUrl)
}

export const routerHistory = createRouterHistory({
  baseUrl: import.meta.env.BASE_URL,
  routerMode: import.meta.env.VITE_ROUTER_MODE,
})
