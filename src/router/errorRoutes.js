import ErrorLayout from './layouts/ErrorLayout.vue'

export default [
  {
    path: '/unauthorized',
    component: ErrorLayout,
    children: [
      {
        path: '',
        name: 'unauthorized',
        component: () => import('@/pages/errors/UnauthorizedPage.vue'),
      },
    ],
  },
  {
    path: '/server-error',
    component: ErrorLayout,
    children: [
      {
        path: '',
        name: 'serverError',
        component: () => import('@/pages/errors/ServerErrorPage.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    component: ErrorLayout,
    children: [
      {
        path: '',
        name: 'notFound',
        component: () => import('@/pages/errors/NotFoundPage.vue'),
      },
    ],
  },
]
