/* =========================
 * DASHBOARD & SYSTEM
 * ========================= */
import dashboardRoutes from './dashboardRoutes'
import systemRoutes from './systemRoutes'

/* =========================
 * GOVERNANCE & STRUCTURE
 * ========================= */
import commissionRoutes from './commissionRoutes'
import commissionersRoutes from './commissionersRoutes'
import committeesRoutes from './committeesRoutes'
import directoratesRoutes from './directoratesRoutes'
import officesRoutes from './officesRoutes'
import sectionsRoutes from './sectionsRoutes'
import servicesRoutes from './servicesRoutes'
import unitsRoutes from './unitsRoutes'

/* =========================
 * CONTENT & PUBLICATIONS
 * ========================= */
import eventsRoutes from './eventsRoutes'
import articlesRoutes from './articlesRoutes'
import bulletinsRoutes from './bulletinsRoutes'
import noticesRoutes from './noticesRoutes'
import photosRoutes from './photosRoutes'
import publicationsRoutes from './publicationsRoutes'
import questionsRoutes from './questionsRoutes'
import videosRoutes from './videosRoutes'
import contentManagementRoutes from './contentManagementRoutes'

/* =========================
 * COMMUNICATION & OUTREACH
 * ========================= */
import inquiriesRoutes from './inquiriesRoutes'
import partnersRoutes from './partnersRoutes'
import socialsRoutes from './socialsRoutes'
import subscribersRoutes from './subscribersRoutes'
import visitorsRoutes from './visitorsRoutes'

/* =========================
 * ASSETS & MEDIA
 * ========================= */
import assetsRoutes from './assetsRoutes'

/* =========================
 * USERS & ACCESS CONTROL
 * ========================= */
import rolesRoutes from './rolesRoutes'
import usersRoutes from './usersRoutes'

/* =========================
 * EXPORT ALL MODULE ROUTES
 * ========================= */
export default [
  ...dashboardRoutes,
  ...systemRoutes,

  ...commissionRoutes,
  ...commissionersRoutes,
  ...committeesRoutes,
  ...directoratesRoutes,
  ...sectionsRoutes,
  ...unitsRoutes,
  ...officesRoutes,
  ...servicesRoutes,

  ...eventsRoutes,
  ...articlesRoutes,
  ...noticesRoutes,
  ...bulletinsRoutes,
  ...contentManagementRoutes,
  ...publicationsRoutes,
  ...questionsRoutes,
  ...videosRoutes,
  ...photosRoutes,

  ...socialsRoutes,
  ...inquiriesRoutes,
  ...subscribersRoutes,
  ...visitorsRoutes,
  ...partnersRoutes,

  ...assetsRoutes,

  ...usersRoutes,
  ...rolesRoutes,
]
