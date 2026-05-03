import api from './axios'
import audit from './auditAPI'
import articles from './blogAPI'
import assets from './assetsAPI'
import commission from './commissionAPI'
import commissioners from './commissionersAPI'
import committees from './committeesAPI'
import dashboard from './dashboardAPI'
import events from './eventsAPI'
import inquiries from './inquiriesAPI'
import contentManagement from './contentManagementAPI'
import directorates from './directoratesAPI'
import locales from './localesAPI'
import offices from './officesAPI'
import notices from './noticesAPI'
import partners from './partnersAPI'
import photos from './photosAPI'
import questions from './questionsAPI'
import publications from './publicationsAPI'
import roles from './rolesAPI'
import scheduler from './schedulerAPI'
import sections from './sectionsAPI'
import services from './servicesAPI'
import socials from './socialsAPI'
import subscribers from './subscribersAPI'
import units from './unitsAPI'
import users from './usersAPI'
import videos from './videosAPI'
import visitors from './visitorsAPI'

const auditAPI = audit({ request: api })
const articlesAPI = articles({ request: api })
const assetsAPI = assets({ request: api })
const commissionAPI = commission({ request: api })
const commissionersAPI = commissioners({ request: api })
const committeesAPI = committees({ request: api })
const dashboardAPI = dashboard({ request: api })
const eventsAPI = events({ request: api })
const inquiriesAPI = inquiries({ request: api })
const contentManagementAPI = contentManagement({ request: api })
const directoratesAPI = directorates({ request: api })
const localesAPI = locales({ request: api })
const officesAPI = offices({ request: api })
const noticesAPI = notices({ request: api })
const partnersAPI = partners({ request: api })
const photosAPI = photos({ request: api })
const questionsAPI = questions({ request: api })
const publicationsAPI = publications({ request: api })
const rolesAPI = roles({ request: api })
const schedulerAPI = scheduler({ request: api })
const sectionsAPI = sections({ request: api })
const servicesAPI = services({ request: api })
const socialsAPI = socials({ request: api })
const subscribersAPI = subscribers({ request: api })
const unitsAPI = units({ request: api })
const usersAPI = users({ request: api })
const videosAPI = videos({ request: api })
const visitorsAPI = visitors({ request: api })

export {
  articlesAPI,
  auditAPI,
  assetsAPI,
  commissionAPI,
  commissionersAPI,
  committeesAPI,
  dashboardAPI,
  directoratesAPI,
  eventsAPI,
  inquiriesAPI,
  contentManagementAPI,
  localesAPI,
  officesAPI,
  noticesAPI,
  partnersAPI,
  photosAPI,
  questionsAPI,
  publicationsAPI,
  rolesAPI,
  schedulerAPI,
  sectionsAPI,
  servicesAPI,
  socialsAPI,
  subscribersAPI,
  unitsAPI,
  usersAPI,
  videosAPI,
  visitorsAPI,
}
export const axiosInstance = api
