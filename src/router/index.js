import { createRouter } from 'vue-router'
import authRoutes from './authRoutes'
import errorRoutes from './errorRoutes'
import { authGuard, permissionGuard, roleGuard, workflowGuard } from './guards'
import { routerHistory } from './history'
import moduleRoutes from './modules'

// ⬇️ import i18n instance
import i18n from '@/i18n'

const router = createRouter({
  history: routerHistory,
  routes: [...authRoutes, ...moduleRoutes, ...errorRoutes],
  scrollBehavior() {
    return { top: 0 }
  },
})

/* ===============================
 * Global Guards (order matters)
 * =============================== */
router.beforeEach(authGuard)
router.beforeEach(roleGuard)
router.beforeEach(permissionGuard)
router.beforeEach(workflowGuard)

/* ===============================
 * Page metadata → document title
 * =============================== */
router.afterEach((to) => {
  const page = to.meta?.page
  if (!page) return

  let title = page.title

  if (page.i18nKey) {
    try {
      title = i18n.global.te(page.i18nKey) ? i18n.global.t(page.i18nKey) : page.title
    } catch {
      // fallback to static title
      title = page.title
    }
  }

  if (title) {
    document.title = `${title} | FCC CMS`
  }
})

export default router
