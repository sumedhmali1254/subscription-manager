# RECURIX — Enterprise Subscription Management & Recurring Billing Platform
## Complete System Architecture, PostgreSQL Database Schema & REST API Specification

> **Platform**: Recurix (for Brightloop Software Pvt Ltd)  
> **Target Production Stack**: React 18, Vite, Tailwind CSS, Node.js / Express, PostgreSQL  
> **Specification Version**: 2.0.0 (Production Master)  
> **Base API URL**: `http://localhost:5000/api`

---

## 1. High-Level Architecture Overview

```
                                      ┌──────────────────────────────────────────────┐
                                      │             RECURIX FRONTEND                 │
                                      │  (React 18 + Vite + Tailwind + Recharts)     │
                                      └──────────────────────┬───────────────────────┘
                                                             │
                                          Axios / REST (Bearer JWT Auth)
                                                             │
                                      ┌──────────────────────▼───────────────────────┐
                                      │              API ROUTING & RBAC              │
                                      │         Express.js / Node.js Backend         │
                                      └───────┬──────────────┬──────────────┬────────┘
                                              │              │              │
                     ┌────────────────────────┼──────────────┴──────────────┤
                     │                        │                             │
        ┌────────────▼──────────┐ ┌───────────▼───────────┐ ┌───────────────▼────────┐
        │  Subscription Engine  │ │  Automated Billing    │ │  Revenue Analytics     │
        │  • Plans & Variants   │ │  • Cron Billing Runs  │ │  • MRR / ARR Reports   │
        │  • Quote-to-Sub Conv  │ │  • GST Invoices & Tax │ │  • AR Aging & Dunning  │
        │  • Pause / Renew / End│ │  • Payment Settlement │ │  • Churn Trends        │
        └────────────┬──────────┘ └───────────┬───────────┘ └───────────────┬────────┘
                     │                        │                             │
                     └────────────────────────┼─────────────────────────────┘
                                              │
                                   node-postgres (pg client)
                                              │
                               ┌──────────────▼──────────────┐
                               │     PostgreSQL Database     │
                               │   (Relational Data Store)   │
                               └─────────────────────────────┘
```

---

## 2. PostgreSQL Relational Database Schema (DDL)

Here is the complete SQL DDL schema for the 14 core tables with constraints, indexes, and triggers.

```sql
-- ============================================================================
-- EXTENSIONS & CUSTOM ENUMS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF', 'CUSTOMER');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE billing_freq AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');
CREATE TYPE quote_status AS ENUM ('DRAFT', 'SENT', 'CONFIRMED', 'CONVERTED', 'REJECTED', 'EXPIRED');
CREATE TYPE sub_status AS ENUM ('DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'CLOSED', 'EXPIRED');
CREATE TYPE inv_status AS ENUM ('DRAFT', 'CONFIRMED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE pay_method AS ENUM ('CASH', 'BANK_TRANSFER', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'AUTO_DEBIT', 'OTHER');
CREATE TYPE pay_status AS ENUM ('SUCCESS', 'PENDING', 'FAILED', 'REFUNDED');
CREATE TYPE disc_type AS ENUM ('PERCENTAGE', 'FIXED');

-- ============================================================================
-- 1. USERS & ROLES
-- ============================================================================
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('USR-' || SUBSTRING(uuid_generate_v4()::text, 1, 8)),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    status user_status NOT NULL DEFAULT 'ACTIVE',
    company VARCHAR(150),
    avatar_url TEXT,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- 2. CUSTOMERS
-- ============================================================================
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('CUST-' || SUBSTRING(uuid_generate_v4()::text, 1, 8)),
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    company VARCHAR(150) NOT NULL,
    gstin VARCHAR(20),
    billing_street TEXT,
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_pincode VARCHAR(20),
    billing_country VARCHAR(100) DEFAULT 'India',
    status user_status DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_company ON customers(company);
CREATE INDEX idx_customers_email ON customers(email);

-- ============================================================================
-- 3. PRODUCTS & PRODUCT VARIANTS
-- ============================================================================
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('PROD-' || SUBSTRING(uuid_generate_v4()::text, 1, 8)),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) DEFAULT 'Software',
    product_type VARCHAR(50) DEFAULT 'Service / SaaS',
    sales_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(12, 2) DEFAULT 0.00,
    description TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_variants (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('VAR-' || SUBSTRING(uuid_generate_v4()::text, 1, 8)),
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    additional_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_variants_pid ON product_variants(product_id);

-- ============================================================================
-- 4. SUBSCRIPTION PLANS
-- ============================================================================
CREATE TABLE subscription_plans (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('PLAN-' || SUBSTRING(uuid_generate_v4()::text, 1, 8)),
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    billing_frequency billing_freq NOT NULL DEFAULT 'MONTHLY',
    base_price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    minimum_quantity INT DEFAULT 1,
    start_date DATE,
    end_date DATE,
    auto_close_on_expiry BOOLEAN DEFAULT TRUE,
    allow_early_closure BOOLEAN DEFAULT TRUE,
    allow_pause BOOLEAN DEFAULT TRUE,
    allow_renewal BOOLEAN DEFAULT TRUE,
    trial_period_days INT DEFAULT 0,
    setup_fee NUMERIC(12, 2) DEFAULT 0.00,
    features JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_plans_status ON subscription_plans(status);

-- ============================================================================
-- 5. QUOTATION TEMPLATES & QUOTATIONS
-- ============================================================================
CREATE TABLE quotation_templates (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('TMPL-' || SUBSTRING(uuid_generate_v4()::text, 1, 8)),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    plan_id VARCHAR(50) REFERENCES subscription_plans(id) ON DELETE SET NULL,
    payment_terms VARCHAR(50) DEFAULT 'NET 15',
    validity_days INT DEFAULT 30,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quotations (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('QTN-' || SUBSTRING(uuid_generate_v4()::text, 1, 8)),
    quotation_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) REFERENCES subscription_plans(id),
    template_id VARCHAR(50) REFERENCES quotation_templates(id) ON DELETE SET NULL,
    quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    terms TEXT,
    status quote_status DEFAULT 'DRAFT',
    converted_subscription_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quotation_line_items (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('QLI-' || SUBSTRING(uuid_generate_v4()::text, 1, 8)),
    quotation_id VARCHAR(50) NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id),
    variant_id VARCHAR(50) REFERENCES product_variants(id),
    description TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    discount_pct NUMERIC(5, 2) DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    amount NUMERIC(12, 2) NOT NULL
);

-- ============================================================================
-- 6. SUBSCRIPTIONS
-- ============================================================================
CREATE TABLE subscriptions (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('SUB-' || SUBSTRING(uuid_generate_v4()::text, 1, 8)),
    subscription_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id),
    plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
    quotation_id VARCHAR(50) REFERENCES quotations(id),
    billing_frequency billing_freq NOT NULL DEFAULT 'MONTHLY',
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    start_date DATE NOT NULL,
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    next_billing_date DATE NOT NULL,
    expiry_date DATE,
    auto_renew BOOLEAN DEFAULT TRUE,
    status sub_status DEFAULT 'ACTIVE',
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_bill ON subscriptions(next_billing_date);

-- ============================================================================
-- 7. INVOICES & LINE ITEMS
-- ============================================================================
CREATE TABLE invoices (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('INV-' || SUBSTRING(uuid_generate_v4()::text, 1, 8)),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    subscription_id VARCHAR(50) REFERENCES subscriptions(id) ON DELETE SET NULL,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id),
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    outstanding_amount NUMERIC(12, 2) NOT NULL,
    status inv_status DEFAULT 'CONFIRMED',
    pdf_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

CREATE TABLE invoice_line_items (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('ILI-' || SUBSTRING(uuid_generate_v4()::text, 1, 8)),
    invoice_id VARCHAR(50) NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id),
    description TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    amount NUMERIC(12, 2) NOT NULL
);

-- ============================================================================
-- 8. PAYMENTS
-- ============================================================================
CREATE TABLE payments (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('PAY-' || SUBSTRING(uuid_generate_v4()::text, 1, 8)),
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_id VARCHAR(50) NOT NULL REFERENCES invoices(id),
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id),
    amount NUMERIC(12, 2) NOT NULL,
    method pay_method NOT NULL DEFAULT 'BANK_TRANSFER',
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reference_number VARCHAR(100),
    status pay_status DEFAULT 'SUCCESS',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);

-- ============================================================================
-- 9. DISCOUNTS & COUPONS
-- ============================================================================
CREATE TABLE discounts (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('DISC-' || SUBSTRING(uuid_generate_v4()::text, 1, 8)),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type disc_type NOT NULL DEFAULT 'PERCENTAGE',
    value NUMERIC(10, 2) NOT NULL,
    minimum_quantity INT DEFAULT 1,
    start_date DATE,
    end_date DATE,
    maximum_usage INT,
    usage_count INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 10. TAXES CONFIGURATION
-- ============================================================================
CREATE TABLE taxes (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('TAX-' || SUBSTRING(uuid_generate_v4()::text, 1, 8)),
    name VARCHAR(50) NOT NULL,
    rate NUMERIC(5, 2) NOT NULL,
    type VARCHAR(20) DEFAULT 'PERCENTAGE',
    is_compound BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 11. BATCH BILLING RUNS
-- ============================================================================
CREATE TABLE billing_runs (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('BRUN-' || SUBSTRING(uuid_generate_v4()::text, 1, 8)),
    run_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'COMPLETED',
    total_subscriptions INT NOT NULL DEFAULT 0,
    invoices_generated INT NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    failed_count INT DEFAULT 0,
    execution_time_seconds NUMERIC(6, 2) DEFAULT 0.00,
    error_summary JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 12. AUDIT TRAIL LOGS
-- ============================================================================
CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('LOG-' || SUBSTRING(uuid_generate_v4()::text, 1, 8)),
    user_id VARCHAR(50),
    user_name VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    resource_id VARCHAR(50),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
```

---

## 3. Calculation Logic & Financial Invariants

The frontend and backend maintain identical financial calculation logic:

### 1. Invoice Line Item Amount
$$\text{Line Amount} = \text{Quantity} \times \text{Unit Price}$$

### 2. Subtotal
$$\text{Subtotal} = \sum_{i=1}^{n} \text{Line Amount}_i$$

### 3. Discount Amount Calculation
- If `PERCENTAGE`:
  $$\text{Discount} = \text{Subtotal} \times \left(\frac{\text{Discount Value}}{100}\right)$$
- If `FIXED`:
  $$\text{Discount} = \min(\text{Discount Value}, \text{Subtotal})$$

### 4. Tax Calculation (GST Indian Jurisdiction)
$$\text{Taxable Base} = \text{Subtotal} - \text{Discount}$$
$$\text{CGST} (9\%) = \text{Taxable Base} \times 0.09$$
$$\text{SGST} (9\%) = \text{Taxable Base} \times 0.09$$
$$\text{Total Tax} = \text{CGST} + \text{SGST} = \text{Taxable Base} \times 0.18$$

### 5. Grand Total & Outstanding Balance
$$\text{Grand Total} = \text{Subtotal} - \text{Discount} + \text{Total Tax}$$
$$\text{Outstanding Balance} = \text{Grand Total} - \sum \text{Payments Received}$$

### 6. Payment Status Transition Rule
- If $\sum \text{Payments} = 0 \implies \text{CONFIRMED}$ (or $\text{OVERDUE}$ if past due date)
- If $0 < \sum \text{Payments} < \text{Grand Total} \implies \text{PARTIALLY\_PAID}$
- If $\sum \text{Payments} \ge \text{Grand Total} \implies \text{PAID}$

---

## 4. REST API Endpoint Catalog

All routes require `Authorization: Bearer <token>` unless marked **[Public]**.

### Auth Module (`/api/auth`)
| Method | Route | Description | Role |
|--------|-------|-------------|------|
| `POST` | `/auth/login` | Email/password sign-in | **[Public]** |
| `POST` | `/auth/register` | Customer sign-up | **[Public]** |
| `POST` | `/auth/logout` | Session invalidation | All |
| `POST` | `/auth/refresh` | Refresh access token | **[Public]** |
| `POST` | `/auth/forgot-password`| Send recovery link | **[Public]** |
| `POST` | `/auth/reset-password` | Submit new password | **[Public]** |
| `GET`  | `/auth/me` | Current session user | All |

### Customer Module (`/api/customers`)
| Method | Route | Description | Role |
|--------|-------|-------------|------|
| `GET`  | `/customers` | List with search & filters | ADMIN, STAFF |
| `POST` | `/customers` | Create new customer | ADMIN, STAFF |
| `GET`  | `/customers/:id` | Full 360 profile | ADMIN, STAFF, CUSTOMER (own) |
| `PUT`  | `/customers/:id` | Update profile / address | ADMIN, STAFF |
| `DELETE`| `/customers/:id`| Soft delete customer | ADMIN |
| `GET`  | `/customers/:id/subscriptions` | Customer subscriptions | ADMIN, STAFF, CUSTOMER (own) |
| `GET`  | `/customers/:id/invoices` | Customer invoices | ADMIN, STAFF, CUSTOMER (own) |

### Products & Variants (`/api/products`)
| Method | Route | Description | Role |
|--------|-------|-------------|------|
| `GET`  | `/products` | List software products | All |
| `POST` | `/products` | Create product | ADMIN, STAFF |
| `GET`  | `/products/:id` | Product details + variants | All |
| `PUT`  | `/products/:id` | Update product | ADMIN, STAFF |
| `DELETE`| `/products/:id`| Delete product | ADMIN |
| `GET`  | `/product-variants`| List all variants | All |
| `POST` | `/product-variants`| Add new variant | ADMIN, STAFF |
| `PUT`  | `/product-variants/:id`| Update variant | ADMIN, STAFF |
| `DELETE`| `/product-variants/:id`| Delete variant | ADMIN |

### Subscription Plans (`/api/plans`)
| Method | Route | Description | Role |
|--------|-------|-------------|------|
| `GET`  | `/plans` | List active plans | All |
| `POST` | `/plans` | Create subscription plan | ADMIN, STAFF |
| `GET`  | `/plans/:id` | Plan details | All |
| `PUT`  | `/plans/:id` | Update plan config | ADMIN, STAFF |
| `DELETE`| `/plans/:id`| Archive plan | ADMIN |
| `PATCH`| `/plans/:id/toggle-status` | Toggle ACTIVE / INACTIVE | ADMIN |

### Quotations & Templates (`/api/quotations`)
| Method | Route | Description | Role |
|--------|-------|-------------|------|
| `GET`  | `/quotations` | List quotations pipeline | ADMIN, STAFF |
| `POST` | `/quotations` | Create draft quote | ADMIN, STAFF |
| `GET`  | `/quotations/:id` | View quotation breakdown | ADMIN, STAFF, CUSTOMER (own) |
| `PUT`  | `/quotations/:id` | Edit draft quotation | ADMIN, STAFF |
| `POST` | `/quotations/:id/send` | Email quote to customer | ADMIN, STAFF |
| `POST` | `/quotations/:id/confirm` | Customer approves quote | CUSTOMER, ADMIN, STAFF |
| `POST` | `/quotations/:id/reject` | Customer declines quote | CUSTOMER, ADMIN, STAFF |
| `POST` | `/quotations/:id/convert` | Convert quote to subscription | ADMIN, STAFF |
| `GET`  | `/quotation-templates` | List reusable templates | ADMIN, STAFF |
| `POST` | `/quotation-templates` | Create template | ADMIN, STAFF |

### Subscriptions (`/api/subscriptions`)
| Method | Route | Description | Role |
|--------|-------|-------------|------|
| `GET`  | `/subscriptions` | List subscriptions | ADMIN, STAFF |
| `POST` | `/subscriptions` | Provision subscription | ADMIN, STAFF |
| `GET`  | `/subscriptions/:id` | View subscription details | ADMIN, STAFF, CUSTOMER (own) |
| `PUT`  | `/subscriptions/:id` | Update subscription config | ADMIN, STAFF |
| `POST` | `/subscriptions/:id/pause` | Pause billing | ADMIN, STAFF |
| `POST` | `/subscriptions/:id/resume`| Resume billing | ADMIN, STAFF |
| `POST` | `/subscriptions/:id/renew` | Force cycle renewal | ADMIN, STAFF |
| `POST` | `/subscriptions/:id/change-plan` | Upgrade/downgrade plan | ADMIN, STAFF |
| `POST` | `/subscriptions/:id/cancel`| Close subscription | ADMIN, STAFF, CUSTOMER (own) |

### Invoices & Payments (`/api/invoices`, `/api/payments`)
| Method | Route | Description | Role |
|--------|-------|-------------|------|
| `GET`  | `/invoices` | List invoices | ADMIN, STAFF |
| `POST` | `/invoices` | Create manual invoice | ADMIN, STAFF |
| `GET`  | `/invoices/:id` | Invoice details & line items | ADMIN, STAFF, CUSTOMER (own) |
| `POST` | `/invoices/:id/send` | Email GST invoice PDF | ADMIN, STAFF |
| `POST` | `/invoices/:id/void` | Void invoice | ADMIN |
| `GET`  | `/invoices/:id/download` | Download PDF stream | ADMIN, STAFF, CUSTOMER (own) |
| `POST` | `/invoices/:id/payments` | Record payment | ADMIN, STAFF, CUSTOMER |
| `GET`  | `/payments` | Search transaction ledger | ADMIN, STAFF |
| `POST` | `/payments/:id/refund` | Refund payment transaction | ADMIN |

### Billing Runs (`/api/billing-runs`)
| Method | Route | Description | Role |
|--------|-------|-------------|------|
| `GET`  | `/billing-runs` | History of billing runs | ADMIN, STAFF |
| `POST` | `/billing-runs` | Trigger immediate batch run | ADMIN, STAFF |
| `GET`  | `/billing-runs/:id` | Run execution metrics | ADMIN, STAFF |
| `POST` | `/billing-runs/:id/retry` | Retry failed renewals | ADMIN, STAFF |

### Reports & Administration
| Method | Route | Description | Role |
|--------|-------|-------------|------|
| `GET`  | `/reports/mrr` | Monthly Recurring Revenue | ADMIN, STAFF |
| `GET`  | `/reports/arr` | Annual Recurring Revenue | ADMIN, STAFF |
| `GET`  | `/reports/churn` | Churn rates and trends | ADMIN, STAFF |
| `GET`  | `/reports/aging` | Accounts Receivable aging | ADMIN, STAFF |
| `GET`  | `/users` | Team member accounts | ADMIN |
| `POST` | `/users` | Invite team member | ADMIN |
| `GET`  | `/taxes` | Tax configurations | ADMIN |
| `POST` | `/taxes` | Create tax rule | ADMIN |
| `GET`  | `/audit-logs` | Immutable audit log trail | ADMIN |
| `GET`  | `/settings` | System settings & API keys | ADMIN |
| `PUT`  | `/settings` | Save company profile | ADMIN |

---

## 5. Role-Based Access Control (RBAC) Matrix

| Module | ADMIN | STAFF | CUSTOMER |
|---|:---:|:---:|:---:|
| **Workspace Overview** | Read / Write | Read / Write | ❌ (Own Portal) |
| **Customers** | Full Access | Create & Edit | Own Profile |
| **Products & Variants** | Full Access | Create & Edit | View Catalog |
| **Subscription Plans** | Full Access | View & Select | View & Request |
| **Quotations** | Full Access | Create & Send | View & Accept/Decline |
| **Quotation Templates**| Full Access | Full Access | ❌ |
| **Subscriptions** | Full Access | Full Access | View & Cancel Own |
| **Invoices** | Full Access | Full Access | View & Pay Own |
| **Payments** | Full Access | Record & View | Pay & View Receipts |
| **Discounts & Coupons**| Full Access | View & Apply | ❌ |
| **Automated Billing** | Full Access | Trigger & View | ❌ |
| **Reports & Analytics**| Full Access | View Dashboards | ❌ |
| **Team Users** | Full Access | ❌ | ❌ |
| **Tax Rules** | Full Access | ❌ | ❌ |
| **Audit Logs** | Full Access | ❌ | ❌ |
| **Company Settings** | Full Access | ❌ | ❌ |

