/**
 * Application route paths. Reference these constants instead of hardcoding
 * strings so navigation stays refactor-safe.
 */
export const ROUTES = {
  home: '/',

  // Single-admin app: login only, no registration.
  auth: {
    login: '/login',
  },

  dashboard: {
    root: '/dashboard',
    // All admin modules are nested under /dashboard. Categories is live; the
    // rest render a "Coming Soon" placeholder until their modules ship.
    categories: '/dashboard/categories',
    products: '/dashboard/products',
    templates: '/dashboard/templates',
    quotations: '/dashboard/quotations',
  },
} as const;
