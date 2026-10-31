/**
 * RECURIX — API Endpoint Constants
 * 
 * All backend REST API endpoints used by the frontend.
 * Base URL is configured via VITE_API_BASE_URL env variable.
 * Default: http://localhost:5000/api
 * 
 * When VITE_USE_MOCK_API=true (default in development), the mock
 * adapter intercepts these calls and serves localStorage data instead.
 * 
 * To connect to real backend: set VITE_USE_MOCK_API=false in .env
 */

// ── Authentication ────────────────────────────────────────────
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',                     // POST  { email, password } → { user, token }
  REGISTER: '/auth/register',               // POST  { name, email, password, company } → { user, token }
  LOGOUT: '/auth/logout',                   // POST  {} → { success }
  REFRESH: '/auth/refresh',                 // POST  { refreshToken } → { token }
  FORGOT_PASSWORD: '/auth/forgot-password',  // POST  { email } → { success, message }
  RESET_PASSWORD: '/auth/reset-password',   // POST  { token, newPassword } → { success }
  ME: '/auth/me',                           // GET   → { user }
};

// ── Customers ─────────────────────────────────────────────────
export const CUSTOMER_ENDPOINTS = {
  LIST: '/customers',                       // GET   ?page&limit&search&status → { data[], total, page }
  CREATE: '/customers',                     // POST  { name, email, phone, company, ... } → { customer }
  GET: (id) => `/customers/${id}`,          // GET   → { customer }
  UPDATE: (id) => `/customers/${id}`,       // PUT   { ...fields } → { customer }
  DELETE: (id) => `/customers/${id}`,       // DELETE → { success }
  SUBSCRIPTIONS: (id) => `/customers/${id}/subscriptions`,  // GET → { subscriptions[] }
  INVOICES: (id) => `/customers/${id}/invoices`,             // GET → { invoices[] }
};

// ── Products ──────────────────────────────────────────────────
export const PRODUCT_ENDPOINTS = {
  LIST: '/products',                        // GET   ?page&limit&search&status → { data[], total }
  CREATE: '/products',                      // POST  { name, code, type, variants[], ... } → { product }
  GET: (id) => `/products/${id}`,           // GET   → { product, variants[] }
  UPDATE: (id) => `/products/${id}`,        // PUT   → { product }
  DELETE: (id) => `/products/${id}`,        // DELETE → { success }
  VARIANTS: (id) => `/products/${id}/variants`,        // GET → { variants[] }
  ADD_VARIANT: (id) => `/products/${id}/variants`,     // POST → { variant }
  UPDATE_VARIANT: (id, vid) => `/products/${id}/variants/${vid}`,   // PUT → { variant }
  DELETE_VARIANT: (id, vid) => `/products/${id}/variants/${vid}`,   // DELETE
};

// ── Subscription Plans ────────────────────────────────────────
export const PLAN_ENDPOINTS = {
  LIST: '/plans',                           // GET   → { data[], total }
  CREATE: '/plans',                         // POST  { name, billingFrequency, basePrice, ... } → { plan }
  GET: (id) => `/plans/${id}`,              // GET   → { plan, features[], addons[] }
  UPDATE: (id) => `/plans/${id}`,           // PUT   → { plan }
  DELETE: (id) => `/plans/${id}`,           // DELETE → { success }
  TOGGLE_STATUS: (id) => `/plans/${id}/toggle-status`,   // PATCH → { plan }
};

// ── Quotations ────────────────────────────────────────────────
export const QUOTATION_ENDPOINTS = {
  LIST: '/quotations',                      // GET   ?status&customerId → { data[], total }
  CREATE: '/quotations',                    // POST  { customerId, planId, lineItems[], ... } → { quotation }
  GET: (id) => `/quotations/${id}`,         // GET   → { quotation, lineItems[], customer }
  UPDATE: (id) => `/quotations/${id}`,      // PUT   → { quotation }
  DELETE: (id) => `/quotations/${id}`,      // DELETE
  SEND: (id) => `/quotations/${id}/send`,   // POST  → { success } — sends email to customer
  CONFIRM: (id) => `/quotations/${id}/confirm`,   // POST → { quotation }
  REJECT: (id) => `/quotations/${id}/reject`,     // POST → { quotation }
  CONVERT: (id) => `/quotations/${id}/convert`,   // POST → { subscription }
  TEMPLATES: '/quotation-templates',              // GET  → { templates[] }
  CREATE_TEMPLATE: '/quotation-templates',        // POST → { template }
};

// ── Subscriptions ─────────────────────────────────────────────
export const SUBSCRIPTION_ENDPOINTS = {
  LIST: '/subscriptions',                   // GET   ?status&customerId → { data[], total }
  CREATE: '/subscriptions',                // POST  { customerId, planId, startDate, ... } → { subscription }
  GET: (id) => `/subscriptions/${id}`,     // GET   → { subscription, invoices[], payments[] }
  UPDATE: (id) => `/subscriptions/${id}`,  // PUT   → { subscription }
  CANCEL: (id) => `/subscriptions/${id}/cancel`,     // POST { reason } → { subscription }
  PAUSE: (id) => `/subscriptions/${id}/pause`,       // POST → { subscription }
  RESUME: (id) => `/subscriptions/${id}/resume`,     // POST → { subscription }
  RENEW: (id) => `/subscriptions/${id}/renew`,       // POST → { subscription }
  CHANGE_PLAN: (id) => `/subscriptions/${id}/change-plan`,   // POST { planId } → { subscription }
  INVOICES: (id) => `/subscriptions/${id}/invoices`,         // GET → { invoices[] }
};

// ── Invoices ──────────────────────────────────────────────────
export const INVOICE_ENDPOINTS = {
  LIST: '/invoices',                        // GET   ?status&customerId&subscriptionId → { data[], total }
  CREATE: '/invoices',                     // POST  { subscriptionId, lineItems[], dueDate } → { invoice }
  GET: (id) => `/invoices/${id}`,          // GET   → { invoice, lineItems[], payments[] }
  UPDATE: (id) => `/invoices/${id}`,       // PUT   → { invoice }
  SEND: (id) => `/invoices/${id}/send`,    // POST  → { success } — emails invoice PDF
  VOID: (id) => `/invoices/${id}/void`,    // POST  → { invoice }
  DOWNLOAD: (id) => `/invoices/${id}/download`,   // GET → PDF blob
  RECORD_PAYMENT: (id) => `/invoices/${id}/payments`,   // POST { amount, method, date, ref } → { payment }
};

// ── Payments ──────────────────────────────────────────────────
export const PAYMENT_ENDPOINTS = {
  LIST: '/payments',                       // GET   ?status&customerId&method → { data[], total }
  GET: (id) => `/payments/${id}`,          // GET   → { payment }
  REFUND: (id) => `/payments/${id}/refund`,   // POST { amount, reason } → { refund }
  RECONCILE: '/payments/reconcile',        // POST  { paymentIds[] } → { success }
};

// ── Discounts ─────────────────────────────────────────────────
export const DISCOUNT_ENDPOINTS = {
  LIST: '/discounts',                      // GET   → { data[], total }
  CREATE: '/discounts',                    // POST  { code, type, value, ... } → { discount }
  GET: (id) => `/discounts/${id}`,         // GET   → { discount }
  UPDATE: (id) => `/discounts/${id}`,      // PUT   → { discount }
  DELETE: (id) => `/discounts/${id}`,      // DELETE
  VALIDATE: '/discounts/validate',         // POST  { code, planId, amount } → { valid, discount, savings }
};

// ── Taxes ─────────────────────────────────────────────────────
export const TAX_ENDPOINTS = {
  LIST: '/taxes',                          // GET   → { data[] }
  CREATE: '/taxes',                        // POST  { name, rate, type, ... } → { tax }
  GET: (id) => `/taxes/${id}`,             // GET   → { tax }
  UPDATE: (id) => `/taxes/${id}`,          // PUT   → { tax }
  DELETE: (id) => `/taxes/${id}`,          // DELETE
  CALCULATE: '/taxes/calculate',           // POST  { amount, taxIds[], state? } → { taxBreakdown[], total }
};

// ── Billing Runs ──────────────────────────────────────────────
export const BILLING_ENDPOINTS = {
  LIST: '/billing-runs',                   // GET   → { data[], total }
  TRIGGER: '/billing-runs',               // POST  { runDate?, subscriptionIds? } → { run }
  GET: (id) => `/billing-runs/${id}`,      // GET   → { run, invoices[], errors[] }
  RETRY_FAILED: (id) => `/billing-runs/${id}/retry`,   // POST → { run }
  CANCEL: (id) => `/billing-runs/${id}/cancel`,        // POST → { run }
};

// ── Reports ───────────────────────────────────────────────────
export const REPORT_ENDPOINTS = {
  MRR: '/reports/mrr',                     // GET   ?from&to → { mrr[], total, growth }
  ARR: '/reports/arr',                     // GET   ?year → { arr }
  CHURN: '/reports/churn',                // GET   ?from&to → { rate, count, trend[] }
  REVENUE: '/reports/revenue',            // GET   ?from&to&groupBy → { data[] }
  SUBSCRIPTIONS_BY_PLAN: '/reports/subscriptions-by-plan',   // GET → { data[] }
  PAYMENT_METHODS: '/reports/payment-methods',               // GET → { data[] }
  AGING: '/reports/aging',                // GET   → { current, overdue30, overdue60, overdue90 }
  EXPORT: '/reports/export',              // POST  { reportType, filters, format } → file blob
};

// ── Users / Team ──────────────────────────────────────────────
export const USER_ENDPOINTS = {
  LIST: '/users',                          // GET   ?role&status → { data[], total }
  CREATE: '/users',                        // POST  { name, email, role, ... } → { user }
  GET: (id) => `/users/${id}`,             // GET   → { user }
  UPDATE: (id) => `/users/${id}`,          // PUT   → { user }
  DELETE: (id) => `/users/${id}`,          // DELETE
  TOGGLE_STATUS: (id) => `/users/${id}/toggle-status`,   // PATCH → { user }
  RESET_PASSWORD: (id) => `/users/${id}/reset-password`,  // POST → { success }
};

// ── Audit Logs ────────────────────────────────────────────────
export const AUDIT_ENDPOINTS = {
  LIST: '/audit-logs',                     // GET   ?userId&action&resource&from&to → { data[], total }
  GET: (id) => `/audit-logs/${id}`,        // GET   → { log }
};

// ── Settings / Company ────────────────────────────────────────
export const SETTINGS_ENDPOINTS = {
  GET: '/settings',                        // GET   → { companyName, logo, currency, timezone, ... }
  UPDATE: '/settings',                     // PUT   { ...settings } → { settings }
  LOGO_UPLOAD: '/settings/logo',           // POST  multipart/form-data → { logoUrl }
  API_KEYS: '/settings/api-keys',          // GET   → { keys[] }
  ROTATE_KEY: '/settings/api-keys/rotate',  // POST → { key }
};

