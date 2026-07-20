/**
 * Application route paths. Reference these constants instead of hardcoding
 * strings so navigation stays refactor-safe.
 */
export const ROUTES = {
  home: '/',

  // Single-admin app: login only, no registration.
  auth: {
    login: '/login',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
  },

  // First-login forced password change (temporary password → own password).
  changePassword: '/change-password',

  dashboard: {
    root: '/dashboard',
    // All admin modules are nested under /dashboard.
    categories: '/dashboard/categories',
    products: '/dashboard/products',
    templates: '/dashboard/templates',
    quotations: '/dashboard/quotations',
    users: '/dashboard/users',
    /** A single user's detail/edit page. */
    userDetails: (id: string) => `/dashboard/users/${id}`,
    roles: '/dashboard/roles',
    /** The signed-in user's own account page. */
    profile: '/dashboard/profile',
  },
} as const;
