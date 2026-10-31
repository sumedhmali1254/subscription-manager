# RECURIX — Application Routes Documentation

Complete reference of all client-side routes, permission requirements, and page components.

---

## 1. Public Routes

No authentication required. Accessible by guests.

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | `LoginPage` | Email and password sign-in with demo quick-fill accounts |
| `/register` | `RegisterPage` | Customer self-registration |
| `/forgot-password` | `ForgotPasswordPage` | Request password reset email |
| `/reset-password` | `ResetPasswordPage` | Reset password using security token |
| `/unauthorized` | `UnauthorizedPage` | 403 Forbidden screen when access is denied |

---

## 2. Authenticated Workspace (`AppLayout`)

Requires `ADMIN` or `STAFF` role. Includes the persistent fixed sidebar, sticky header with global search (`⌘K`), quick-create menu, and notifications.

### Workspace & Revenue Management

| Route | Component | Allowed Roles | Description |
|-------|-----------|:-------------:|-------------|
| `/dashboard` | `DashboardPage` | ADMIN, STAFF | Executive overview with MRR, ARR, active subscriber stats, trends |
| `/customers` | `CustomerListPage` | ADMIN, STAFF | Customer directory with search, filter, CSV export, creation modal |
| `/customers/:id` | `CustomerDetailPage` | ADMIN, STAFF | Complete customer 360° view: subscriptions, invoices, payment history |
| `/products` | `ProductListPage` | ADMIN, STAFF | Software products catalog |
| `/products/:id` | `ProductDetailPage` | ADMIN, STAFF | Product specifications and variant pricing management |
| `/product-variants` | `ProductVariantsPage` | ADMIN, STAFF | Cross-product variants, tier pricing, and SKU directory |
| `/plans` | `PlanListPage` | ADMIN, STAFF | Subscription plans grid & table with monthly/annual toggle |
| `/plans/:id` | `PlanDetailPage` | ADMIN, STAFF | Plan tier configuration and attached add-ons |
| `/quotations` | `QuotationListPage` | ADMIN, STAFF | Quotation management, status filters, and pipeline |
| `/quotations/new` | `QuotationCreatePage` | ADMIN, STAFF | Interactive quote builder with dynamic tax calculation |
| `/quotations/:id` | `QuotationDetailPage` | ADMIN, STAFF | Quotation details, PDF preview, send email, and convert to subscription |
| `/quotation-templates` | `QuotationTemplatesPage` | ADMIN, STAFF | Reusable quotation templates with default plans, terms, and notes |
| `/subscriptions` | `SubscriptionListPage` | ADMIN, STAFF | Active and expiring subscriptions with lifecycle metrics |
| `/subscriptions/new` | `SubscriptionCreatePage` | ADMIN, STAFF | Direct subscription provisioner |
| `/subscriptions/:id` | `SubscriptionDetailPage` | ADMIN, STAFF | Lifecycle controls: Pause, Resume, Change Plan, Cancel |
| `/invoices` | `InvoiceListPage` | ADMIN, STAFF | Invoices ledger with payment collection status |
| `/invoices/:id` | `InvoiceDetailPage` | ADMIN, STAFF | Formal GST invoice view, PDF download, email, record payment |
| `/payments` | `PaymentListPage` | ADMIN, STAFF | Transactions record, payment gateways, reconcile actions |
| `/discounts` | `DiscountListPage` | ADMIN, STAFF | Coupon codes and promotional discount rules |
| `/billing-runs` | `BillingRunsPage` | ADMIN, STAFF | Automated billing run execution and batch renewal processing |
| `/reports` | `ReportsPage` | ADMIN, STAFF | Deep analytics: MRR growth, plan breakdown, AR aging |

### Administration (ADMIN Only)

| Route | Component | Allowed Roles | Description |
|-------|-----------|:-------------:|-------------|
| `/taxes` | `TaxListPage` | ADMIN | Tax rules & rates configuration (CGST, SGST, IGST) |
| `/users` | `UserListPage` | ADMIN | Team members management, invite staff, toggle status |
| `/audit-logs` | `AuditLogsPage` | ADMIN | Immutable audit trail of administrative activities |
| `/settings` | `SettingsPage` | ADMIN | Company info, currency, billing policies, API keys rotation |

---

## 3. Customer Self-Service Portal (`CustomerLayout`)

Requires `CUSTOMER` or `ADMIN` role. Clean, focused customer experience for client accounts.

| Route | Component | Description |
|-------|-----------|-------------|
| `/portal` | `CustomerDashboardPage` | Customer home: active plan, next payment due, recent invoices |
| `/portal/subscriptions` | `CustomerSubscriptionsPage` | View active plans, manage auto-renewal, request plan upgrade |
| `/portal/invoices` | `CustomerInvoicesPage` | View invoices, download tax receipts, make payments |
| `/portal/payments` | `CustomerPaymentsPage` | Payment history and payment receipts |
| `/portal/quotations` | `CustomerQuotationsPage` | Review quotations sent by sales team; Accept or Decline |
| `/portal/plans` | `CustomerPlansPage` | Explore Brightloop software plans and submit switch requests |
| `/portal/profile` | `CustomerProfilePage` | Manage organization info, GSTIN, and billing address |

---

## 4. Route Navigation Helper

Use `ROUTES` imported from `src/routes/ROUTES.js` for strongly typed navigation:

```javascript
import { ROUTES } from '@/routes/ROUTES';

// Navigate to detail pages:
navigate(ROUTES.SUBSCRIPTIONS.DETAIL('SUB-2026-001'));
navigate(ROUTES.CUSTOMERS.DETAIL('CUST-001'));
```

