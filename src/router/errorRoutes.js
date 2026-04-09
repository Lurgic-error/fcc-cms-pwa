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
