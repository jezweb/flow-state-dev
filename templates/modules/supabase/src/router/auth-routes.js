// Authentication routes to be merged with main router
export const authRoutes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../views/SignupView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('../views/ForgotPasswordView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('../views/ResetPasswordView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  }
]

// Navigation guard for authentication
export const authGuard = (to, from, next) => {
  const auth = useAuthStore()
  const requiresAuth = to.meta.requiresAuth !== false
  
  if (requiresAuth && !auth.isAuthenticated) {
    next('/login')
  } else if (!requiresAuth && auth.isAuthenticated && to.path === '/login') {
    next('/dashboard')
  } else {
    next()
  }
}