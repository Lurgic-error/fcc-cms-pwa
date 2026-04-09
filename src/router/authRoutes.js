import AuthLayout from './layouts/AuthLayout.vue'

export default [
  {
    path: '/',
    redirect: { name: 'dashboard.overview' },
  },
  {
    path: '/auth',
    component: AuthLayout,
    meta: {
      guestOnly: true,
    },
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/pages/auth/LoginPage.vue'),
        meta: {
          page: {
            title: 'Sign In',
            i18nKey: 'pages.auth.login',
          },
        },
      },
      {
        path: 'forgot-password',
        name: 'forgotPassword',
        component: () => import('@/pages/auth/ForgotPasswordPage.vue'),
        meta: {
          page: {
            title: 'Forgot Password',
            i18nKey: 'pages.auth.forgotPassword',
          },
        },
      },
      {
        path: 'reset-password',
        name: 'resetPassword',
        component: () => import('@/pages/auth/ResetPasswordPage.vue'),
        meta: {
          page: {
            title: 'Reset Password',
            i18nKey: 'pages.auth.resetPassword',
          },
        },
      },
    ],
  },
]
