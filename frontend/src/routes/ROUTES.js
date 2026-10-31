/**
 * RECURIX — Application Route Constants
 * 
 * Centralized route paths to prevent typos and ensure clean navigations.
 * 
 * Usage:
 *   import { ROUTES } from '../routes/ROUTES';
 *   navigate(ROUTES.CUSTOMERS.LIST);
 *   navigate(ROUTES.CUSTOMERS.DETAIL(customer.id));
 */

export const ROUTES = {
  // ── Root ────────────────────────────────────────────────────
  ROOT: '/',

  // ── Authentication ───────────────────────────────────────────
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    UNAUTHORIZED: '/unauthorized',
  },

  // ── Workspace ────────────────────────────────────────────────
  DASHBOARD: '/dashboard',

  // ── Customers ────────────────────────────────────────────────
  CUSTOMERS: {
    LIST: '/customers',
    DETAIL: (id) => `/customers/${id || ':id'}`,
    CREATE: '/customers?action=create',
  },

  // ── Products ─────────────────────────────────────────────────
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id) => `/products/${id || ':id'}`,
    CREATE: '/products?action=create',
    VARIANTS: '/product-variants',
  },

  // ── Subscription Plans ────────────────────────────────────────
  PLANS: {
    LIST: '/plans',
    DETAIL: (id) => `/plans/${id || ':id'}`,
    CREATE: '/plans?action=create',
  },

  // ── Quotations ───────────────────────────────────────────────
  QUOTATIONS: {
    LIST: '/quotations',
    NEW: '/quotations/new',
    DETAIL: (id) => `/quotations/${id || ':id'}`,
    TEMPLATES: '/quotation-templates',
  },

  // ── Subscriptions ────────────────────────────────────────────
  SUBSCRIPTIONS: {
    LIST: '/subscriptions',
    NEW: '/subscriptions/new',
    DETAIL: (id) => `/subscriptions/${id || ':id'}`,
  },

  // ── Invoices & Payments ──────────────────────────────────────
  INVOICES: {
    LIST: '/invoices',
    DETAIL: (id) => `/invoices/${id || ':id'}`,
    CREATE: '/invoices?action=create',
  },
  PAYMENTS: {
    LIST: '/payments',
  },

  // ── Sales & Billing ──────────────────────────────────────────
  DISCOUNTS: {
    LIST: '/discounts',
  },
  BILLING_RUNS: {
    LIST: '/billing-runs',
  },
  REPORTS: '/reports',

  // ── Administration (Admin Only) ─────────────────────────────
  TAXES: {
    LIST: '/taxes',
  },
  USERS: {
    LIST: '/users',
  },
  AUDIT_LOGS: '/audit-logs',
  SETTINGS: '/settings',

  // ── Customer Portal ──────────────────────────────────────────
  PORTAL: {
    DASHBOARD: '/portal',
    SUBSCRIPTIONS: '/portal/subscriptions',
    INVOICES: '/portal/invoices',
    PAYMENTS: '/portal/payments',
    QUOTATIONS: '/portal/quotations',
    PLANS: '/portal/plans',
    PROFILE: '/portal/profile',
  },
};

