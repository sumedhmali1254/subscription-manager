# RECURIX — POSTGRESQL PRODUCTION DATABASE SCHEMA

This schema is designed specifically for Brightloop Software's **RECURIX Subscription Management Platform**.

As per hackathon backend requirements, this schema is written in **Pure ANSI PostgreSQL DDL** for direct execution using `node-postgres` (`pg`) without any ORM (no Prisma, no Sequelize, no TypeORM).

---

## 1. POSTGRESQL EXTENSIONS & ENUMS

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Roles
CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF', 'CUSTOMER');

-- Subscription Lifecycle States
CREATE TYPE subscription_status AS ENUM (
  'DRAFT',
  'QUOTATION',
  'CONFIRMED',
  'ACTIVE',
  'PAUSED',
  'CLOSED',
  'CANCELLED',
  'EXPIRED'
);

-- Billing Frequencies
CREATE TYPE billing_frequency AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- Invoice Lifecycle States
CREATE TYPE invoice_status AS ENUM (
  'DRAFT',
  'CONFIRMED',
  'PAID',
  'PARTIALLY_PAID',
  'OVERDUE',
  'CANCELLED'
);

-- Quotation Lifecycle States
CREATE TYPE quotation_status AS ENUM (
  'DRAFT',
  'SENT',
  'CONFIRMED',
  'CONVERTED',
  'CANCELLED',
  'EXPIRED'
);

-- Payment Methods
CREATE TYPE payment_method AS ENUM (
  'BANK_TRANSFER',
  'UPI',
  'CARD',
  'CASH',
  'OTHER'
);

-- Payment Statuses
CREATE TYPE payment_status AS ENUM ('SUCCESS', 'PENDING', 'FAILED');

-- Product Types
CREATE TYPE product_type AS ENUM ('SERVICE', 'CONSUMABLE', 'STORABLE');

-- Discount Types
CREATE TYPE discount_type AS ENUM ('PERCENTAGE', 'FIXED');
```

---

## 2. TABLE DEFINITIONS (DDL)

### 2.1 Users (`users`)
```sql
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY DEFAULT ('USR-' || to_char(nextval('user_seq'), 'FM000')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    phone VARCHAR(50),
    avatar_url TEXT,
    company_name VARCHAR(255),
    customer_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 2.2 Customers (`customers`)
```sql
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    gstin VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    total_subscriptions INTEGER DEFAULT 0,
    active_subscriptions INTEGER DEFAULT 0,
    total_revenue NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_company ON customers(company);
CREATE INDEX idx_customers_status ON customers(status);
```

### 2.3 Products & Variants (`products`, `product_variants`)
```sql
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type product_type NOT NULL DEFAULT 'SERVICE',
    sales_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(12, 2) DEFAULT 0.00,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_variants (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    attribute VARCHAR(100) NOT NULL DEFAULT 'Tier',
    price_adjustment NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_variants_pid ON product_variants(product_id);
```

### 2.4 Subscription Plans (`subscription_plans`, `plan_included_products`)
```sql
CREATE TABLE subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    billing_frequency billing_frequency NOT NULL DEFAULT 'MONTHLY',
    minimum_quantity INTEGER DEFAULT 1,
    available_from DATE DEFAULT CURRENT_DATE,
    available_until DATE,
    auto_close_at_end BOOLEAN DEFAULT FALSE,
    allow_early_closure BOOLEAN DEFAULT TRUE,
    allow_pause BOOLEAN DEFAULT TRUE,
    allow_renewal BOOLEAN DEFAULT TRUE,
    active_status BOOLEAN DEFAULT TRUE,
    subscribers_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plan_included_products (
    id SERIAL PRIMARY KEY,
    plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id),
    variant_id VARCHAR(50) REFERENCES product_variants(id),
    name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1
);
```

### 2.5 Quotations & Templates (`quotations`, `quotation_lines`, `quotation_templates`)
```sql
CREATE TABLE quotations (
    id VARCHAR(50) PRIMARY KEY,
    quotation_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id),
    plan_id VARCHAR(50) REFERENCES subscription_plans(id),
    quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL,
    payment_terms VARCHAR(100) DEFAULT 'NET 15',
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status quotation_status NOT NULL DEFAULT 'DRAFT',
    notes TEXT,
    converted_subscription_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quotation_lines (
    id SERIAL PRIMARY KEY,
    quotation_id VARCHAR(50) NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00
);

CREATE TABLE quotation_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    plan_id VARCHAR(50) REFERENCES subscription_plans(id),
    payment_terms VARCHAR(100) DEFAULT 'NET 15',
    validity_days INTEGER DEFAULT 30,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.6 Subscriptions (`subscriptions`, `subscription_lines`, `subscription_addons`)
```sql
CREATE TABLE subscriptions (
    id VARCHAR(50) PRIMARY KEY,
    subscription_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id),
    plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
    billing_frequency billing_frequency NOT NULL DEFAULT 'MONTHLY',
    status subscription_status NOT NULL DEFAULT 'CONFIRMED',
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'INR',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    next_billing_date DATE,
    payment_terms VARCHAR(100) DEFAULT 'NET 15',
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscription_lines (
    id SERIAL PRIMARY KEY,
    subscription_id VARCHAR(50) NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    total NUMERIC(12, 2) NOT NULL
);

CREATE TABLE subscription_addons (
    id VARCHAR(50) PRIMARY KEY,
    subscription_id VARCHAR(50) NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    billing_frequency billing_frequency DEFAULT 'MONTHLY',
    added_date DATE DEFAULT CURRENT_DATE
);

CREATE INDEX idx_subs_customer ON subscriptions(customer_id);
CREATE INDEX idx_subs_status ON subscriptions(status);
CREATE INDEX idx_subs_next_billing ON subscriptions(next_billing_date);
```

### 2.7 Invoices (`invoices`, `invoice_items`)
```sql
CREATE TABLE invoices (
    id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    subscription_id VARCHAR(50) REFERENCES subscriptions(id),
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id),
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    outstanding_balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status invoice_status NOT NULL DEFAULT 'DRAFT',
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id VARCHAR(50) NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    amount NUMERIC(12, 2) NOT NULL
);

CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due ON invoices(due_date);
```

### 2.8 Payments (`payments`)
```sql
CREATE TABLE payments (
    id VARCHAR(50) PRIMARY KEY,
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    transaction_id VARCHAR(100),
    customer_id VARCHAR(50) NOT NULL REFERENCES customers(id),
    invoice_id VARCHAR(50) NOT NULL REFERENCES invoices(id),
    payment_method payment_method NOT NULL DEFAULT 'BANK_TRANSFER',
    amount NUMERIC(12, 2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status payment_status NOT NULL DEFAULT 'SUCCESS',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
```

### 2.9 Discounts & Taxes (`discounts`, `taxes`)
```sql
CREATE TABLE discounts (
    id VARCHAR(50) PRIMARY KEY,
    discount_name VARCHAR(100) UNIQUE NOT NULL,
    discount_type discount_type NOT NULL DEFAULT 'PERCENTAGE',
    discount_value NUMERIC(10, 2) NOT NULL,
    minimum_purchase NUMERIC(12, 2) DEFAULT 0.00,
    minimum_quantity INTEGER DEFAULT 1,
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    usage_limit INTEGER DEFAULT 100,
    used_count INTEGER DEFAULT 0,
    application_scope VARCHAR(50) DEFAULT 'ENTIRE_SUBSCRIPTION',
    active_status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE taxes (
    id VARCHAR(50) PRIMARY KEY,
    tax_name VARCHAR(255) NOT NULL,
    tax_rate NUMERIC(5, 2) NOT NULL,
    tax_type VARCHAR(50) DEFAULT 'PERCENTAGE',
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    active_status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.10 Billing Runs (`billing_runs`, `billing_run_failures`)
```sql
CREATE TABLE billing_runs (
    id VARCHAR(50) PRIMARY KEY,
    run_number VARCHAR(100) UNIQUE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    processed_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    error_summary TEXT
);

CREATE TABLE billing_run_failures (
    id SERIAL PRIMARY KEY,
    run_id VARCHAR(50) NOT NULL REFERENCES billing_runs(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100),
    customer VARCHAR(255),
    amount NUMERIC(12, 2),
    reason TEXT
);
```

### 2.11 Audit Logs & Company Settings (`audit_logs`, `company_settings`)
```sql
CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    record_id VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

CREATE TABLE company_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    company_name VARCHAR(255) NOT NULL DEFAULT 'Brightloop Software Pvt Ltd',
    tagline VARCHAR(255) DEFAULT 'Manage Recurring Revenue. Simplify Growth.',
    legal_name VARCHAR(255),
    gstin VARCHAR(50),
    cin VARCHAR(50),
    pan VARCHAR(50),
    email VARCHAR(255),
    support_email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    default_currency VARCHAR(10) DEFAULT 'INR',
    default_tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    payment_terms VARCHAR(50) DEFAULT 'NET 15',
    grace_period_days INTEGER DEFAULT 7,
    auto_invoice_generation BOOLEAN DEFAULT TRUE,
    send_email_on_invoice BOOLEAN DEFAULT TRUE,
    send_reminder_before_due BOOLEAN DEFAULT TRUE,
    reminder_days_before INTEGER DEFAULT 3,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

