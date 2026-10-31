# RECURIX — FRONTEND ARCHITECTURE & DESIGN SYSTEM

**Application Name**: RECURIX  
**Tagline**: Manage Recurring Revenue. Simplify Growth.  
**Organization**: Brightloop Software Pvt Ltd  
**Language**: JavaScript ES6+ (JSX Only — No TypeScript)

---

## 1. TECHNOLOGY STACK

- **Core Framework**: React 18.3 (`react`, `react-dom`)
- **Build Tool**: Vite 5.4 (ultra-fast HMR, Rollup production chunk splitting)
- **Styling**: Tailwind CSS 3.4 with custom design tokens
- **Routing**: React Router DOM v6.26 (Nested layouts, protected routes, role guards)
- **Icons**: Lucide React
- **Analytics Visualizations**: Recharts (Area, Line, Donut, Bar charts)
- **API Client**: Axios (Centralized interceptors, JWT authorization, mock adapter fallback)
- **Notifications**: Sonner (Toast notifications)
- **Date Utilities**: date-fns v3

---

## 2. DESIGN SYSTEM & BRAND TOKENS

### Typography
- **Headings & Brand Title**: Plus Jakarta Sans (`font-heading`)
- **Body, Forms, Tables**: Inter (`font-sans`)

### Color Palette
| Token | Hex Code | Purpose |
|---|---|---|
| Primary Background | `#F5F6FA` | Main canvas background |
| Sidebar Background | `#252D55` | Deep navy persistent sidebar |
| Primary Brand | `#5263D9` | Buttons, active navigation, primary accents |
| Primary Hover | `#414FC0` | Button hover states |
| Secondary Teal | `#14A38B` | Positive badges, callouts, alternate metrics |
| Main Text | `#202744` | High-contrast readable typography |
| Secondary Text | `#64748B` | Subtitles, labels, metadata |
| Border | `#E7EAF0` | Subtle clean card and table dividers |
| Success | `#16A34A` | Active subscriptions, paid invoices, success toasts |
| Warning | `#F59E0B` | Paused subscriptions, partially paid invoices |
| Danger | `#DC5656` | Overdue invoices, cancelled contracts, errors |

---

## 3. DIRECTORY STRUCTURE

```
frontend/
├── API_SPECIFICATION.md       # Comprehensive REST API contract for backend team
├── DATABASE_SCHEMA.md         # Production PostgreSQL schema (Raw SQL DDL for node-postgres)
├── FRONTEND_ARCHITECTURE.md   # Architectural blueprint and component inventory
├── index.html                 # HTML shell with Google Fonts preconnections
├── package.json               # Pinned dependencies
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Theme tokens and custom typography
├── vite.config.js             # Vite configuration with chunk splitting
├── public/
│   └── recurix-icon.svg       # Geometric R brand logo SVG
└── src/
    ├── assets/                # Static brand graphics
    ├── constants/
    │   ├── navigation.js      # Grouped sidebar & customer navigation definitions
    │   ├── roles.js           # Roles (ADMIN, STAFF, CUSTOMER) & permissions matrix
    │   └── status.js          # Status badge configs, colors, and lifecycle definitions
    ├── context/
    │   ├── AuthContext.jsx    # Auth state, login/logout, instant demo role switcher
    │   └── NotificationContext.jsx # Notification center, unread counters, alert stream
    ├── services/
    │   ├── api.js             # Centralized Axios instance with interceptors
    │   ├── mockData.js        # Seed dataset for Brightloop Software
    │   ├── mockAdapter.js     # In-memory/localStorage CRUD adapter for zero-error development
    │   ├── authService.js     # Login, registration, password recovery
    │   ├── customerService.js # Customer accounts, profiles, relations
    │   ├── productService.js  # Software catalog and dynamic product variants
    │   ├── planService.js     # Subscription plan tiers, policies, included products
    │   ├── quotationService.js# Quotations, line items, 1-click subscription conversion
    │   ├── subscriptionService.js # Lifecycle transitions (Draft->Confirmed->Active->Paused->Closed)
    │   ├── invoiceService.js  # Tax invoices, balance tracking, PDF print previews
    │   ├── paymentService.js  # Payment receipts, UPI/RTGS allocations, ledger
    │   ├── discountService.js # Promotional coupons and subscription discounts
    │   ├── taxService.js      # GST tax rules and international export rates
    │   ├── billingService.js  # Automated renewal sweep runs and retry mechanics
    │   ├── reportService.js   # MRR, ARR, Invoiced vs Collected cash reconciliation
    │   ├── userService.js     # Staff accounts and access role configuration
    │   └── auditService.js    # Immutable security event log
    ├── components/
    │   ├── common/            # Button, Badge, StatusBadge, Card, Modal, Drawer,
    │   │                      # ConfirmationDialog, EmptyState, LoadingSkeleton,
    │   │                      # Pagination, Tooltip, Tabs, Avatar, StatCard
    │   ├── forms/             # Input, Select, Textarea, Checkbox, Switch, FormField
    │   ├── tables/            # DataTable (sortable, searchable, filterable, CSV export)
    │   ├── charts/            # AreaTrendChart, LineGrowthChart, DonutDistributionChart,
    │   │                      # BarMetricChart, ChartCard
    │   └── layout/            # Sidebar, Header, Footer, Breadcrumbs, PageHeader,
    │                          # NotificationPanel, ProfileDropdown, GlobalSearchModal
    ├── layouts/
    │   ├── AppLayout.jsx      # Admin/Staff persistent layout (Collapsible sidebar + Header + Footer)
    │   ├── CustomerLayout.jsx # Customer portal layout (Simplified navbar + Customer profile)
    │   └── AuthLayout.jsx     # Split-screen auth layout (Value prop showcase + Form card)
    ├── pages/
    │   ├── auth/              # Login, Register, Forgot Password, Reset Password, 403
    │   ├── dashboard/         # Executive overview (6 KPIs, 4 charts, tables, activity)
    │   ├── customers/         # Customer listing, detail tabs, add/edit modal
    │   ├── products/          # Catalog, dynamic variant builder (+₹560, +₹1200)
    │   ├── plans/             # Subscription tiers, grid/table view toggle, policies
    │   ├── quotations/        # Proposals, dynamic lines, print preview, convert-to-sub
    │   ├── subscriptions/     # Complete lifecycle state machine, add-ons, renewals
    │   ├── invoices/          # Tax invoices, balance due, payment recording, print/PDF
    │   ├── payments/          # Payment ledger, method breakdown, transaction IDs
    │   ├── discounts/         # Coupon codes, percentage/fixed value, usage limits
    │   ├── taxes/             # GST 18%, 12%, 0% export rules
    │   ├── billing/           # Automated billing runs with progress animation & retry
    │   ├── reports/           # Financial analytics, invoiced vs collected, CSV export
    │   ├── users/             # Team members, role access (restricted to Admin)
    │   ├── audit/             # Audit log event stream
    │   ├── settings/          # Company profile, tax ID, billing grace, email rules
    │   └── portal/            # Customer self-service (Dashboard, Subs, Invoices, Payments, Plans)
    ├── routes/
    │   ├── AppRoutes.jsx      # Route table with role permissions
    │   └── ProtectedRoute.jsx # Authentication and role enforcement guards
    ├── utils/
    │   ├── formatters.js      # formatCurrency (₹ INR default), formatDate, formatPercentage
    │   ├── validators.js      # Email validation, real-time password strength meter
    │   └── exportCsv.js       # Client-side table CSV download generator
    ├── styles/
    │   └── index.css          # Tailwind base, components, custom scrollbar, print styles
    ├── App.jsx                # Application root with context providers & toast container
    └── main.jsx               # React entrypoint
```

---

## 4. ROLE-BASED ACCESS CONTROL (RBAC)

The application provides 3 strictly defined roles:
1. **ADMIN**: Full unrestricted access to all modules, team member creation, tax configuration, company settings, and audit logs.
2. **STAFF**: Access to daily operational billing (Customers, Products, Plans, Quotations, Subscriptions, Invoices, Payments, Billing Runs, Reports). Access to Team Members, Taxes, Audit Logs, and Organization Settings is restricted.
3. **CUSTOMER**: Access is strictly isolated to `/portal` routes with their own data. Cannot see internal admin margins, team members, or other customers' data.

### Instant Role Switcher (For Hackathon Evaluators)
In the top-right user profile dropdown (or top navigation bar), clicking **"Switch Demo Role"** allows the jury to toggle between `Admin`, `Staff`, and `Customer` instantly to verify role-based permissions without logging in and out.

