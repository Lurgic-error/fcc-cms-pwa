// Route definitions
const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../pages/dashboard/DashboardPage.vue'),
  },
  // Add other routes here
]

export default routes
