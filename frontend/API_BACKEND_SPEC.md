# RECURIX — Backend API Specification & Schema Reference

> **Version**: 1.0.0  
> **Base URL**: `http://localhost:5000/api`  
> **Auth Scheme**: `Authorization: Bearer <jwt_token>`  
> **Content-Type**: `application/json`

---

## 1. Environment Configuration

```env
# Frontend .env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_USE_MOCK_API=false   # Set to true for localStorage mock, false for live backend
```

---

## 2. Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/login` | Login with email and password | No |
| `POST` | `/auth/register` | Register customer account | No |
| `POST` | `/auth/logout` | Invalidate token/session | Yes |
| `POST` | `/auth/refresh` | Refresh expired access token | No |
| `POST` | `/auth/forgot-password` | Send password recovery email | No |
| `POST` | `/auth/reset-password` | Set new password with token | No |
| `GET`  | `/auth/me` | Fetch authenticated user profile | Yes |

### Login Payload
```json
{
  "email": "admin@brightloop.io",
  "password": "Password@123"
}
```

### Login Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "USR-001",
      "name": "Sarah Jenkins",
      "email": "admin@brightloop.io",
      "role": "ADMIN",
      "status": "ACTIVE",
      "avatar": "https://..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "d8a7c29e..."
  }
}
```

---

## 3. Customer Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/customers` | List customers (`?page=1&limit=10&search=&status=`) |
| `POST` | `/customers` | Create new customer |
| `GET` | `/customers/:id` | Get customer profile & metrics |
| `PUT` | `/customers/:id` | Update customer record |
| `DELETE` | `/customers/:id` | Soft-delete customer |
| `GET` | `/customers/:id/subscriptions` | Customer's active/past subscriptions |
| `GET` | `/customers/:id/invoices` | Customer's billing invoices |

### Customer Schema
```json
{
  "id": "CUST-001",
  "name": "Priya Sharma",
  "email": "priya.sharma@acmetech.com",
  "phone": "+91 98765 43210",
  "company": "Acme Technologies Pvt Ltd",
  "gstin": "27AABCU9603R1ZX",
  "billingAddress": {
    "street": "402 Tech Hub, Outer Ring Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560103",
    "country": "India"
  },
  "status": "ACTIVE",
  "mrr": 24999.00,
  "createdAt": "2026-01-15T10:00:00Z"
}
```

---

## 4. Products & Variants

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/products` | List all products with variant counts |
| `POST` | `/products` | Create product with optional variants |
| `GET` | `/products/:id` | Get product details + variant list |
| `PUT` | `/products/:id` | Update product |
| `DELETE` | `/products/:id` | Delete product |
| `POST` | `/products/:id/variants` | Add variant to product |
| `PUT` | `/products/:id/variants/:vid` | Update variant pricing/sku |
| `DELETE` | `/products/:id/variants/:vid` | Remove variant |

---

## 5. Subscription Plans

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/plans` | List plans (`?status=ACTIVE`) |
| `POST` | `/plans` | Create subscription plan |
| `GET` | `/plans/:id` | Get plan, tier pricing, and add-ons |
| `PUT` | `/plans/:id` | Update plan details |
| `DELETE` | `/plans/:id` | Archive plan |
| `PATCH` | `/plans/:id/toggle-status` | Toggle ACTIVE / INACTIVE |

### Plan Schema
```json
{
  "id": "PLAN-001",
  "name": "Enterprise Scale",
  "code": "ENT-SCALE",
  "billingFrequency": "MONTHLY",
  "basePrice": 24999.00,
  "currency": "INR",
  "trialPeriodDays": 14,
  "setupFee": 5000.00,
  "status": "ACTIVE",
  "features": [
    "Unlimited Team Seats",
    "Custom Workflows & SLA",
    "Dedicated Account Manager",
    "99.99% Uptime Guarantee"
  ]
}
```

---

## 6. Quotations Lifecycle

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/quotations` | List quotations (`?status=&customerId=`) |
| `POST` | `/quotations` | Create draft quotation |
| `GET` | `/quotations/:id` | Full quotation breakdown with taxes |
| `PUT` | `/quotations/:id` | Update quotation draft |
| `POST` | `/quotations/:id/send` | Send formal quote email to customer |
| `POST` | `/quotations/:id/confirm` | Customer approves quotation |
| `POST` | `/quotations/:id/reject` | Customer declines quote |
| `POST` | `/quotations/:id/convert` | **Convert quotation into live Subscription** |
| `GET` | `/quotation-templates` | List reusable quotation templates |

---

## 7. Subscriptions Lifecycle

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/subscriptions` | List subscriptions (`?status=ACTIVE&page=1`) |
| `POST` | `/subscriptions` | Provision new subscription |
| `GET` | `/subscriptions/:id` | Subscription timeline, plan, and invoices |
| `PUT` | `/subscriptions/:id` | Update subscription config |
| `POST` | `/subscriptions/:id/cancel` | Cancel subscription (`{ reason: "..." }`) |
| `POST` | `/subscriptions/:id/pause` | Pause recurring billing |
| `POST` | `/subscriptions/:id/resume` | Resume active billing |
| `POST` | `/subscriptions/:id/renew` | Trigger immediate renewal |
| `POST` | `/subscriptions/:id/change-plan` | Upgrade/downgrade subscription plan |

---

## 8. Invoices & Billing Runs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/invoices` | List invoices (`?status=&subscriptionId=`) |
| `POST` | `/invoices` | Create manual ad-hoc invoice |
| `GET` | `/invoices/:id` | Invoice details & line items |
| `POST` | `/invoices/:id/send` | Email GST invoice PDF |
| `POST` | `/invoices/:id/void` | Void uncollectible invoice |
| `GET` | `/invoices/:id/download` | Stream PDF blob |
| `POST` | `/invoices/:id/payments` | Record offline/manual payment |
| `GET` | `/billing-runs` | History of automated billing runs |
| `POST` | `/billing-runs` | Execute immediate batch billing run |
| `POST` | `/billing-runs/:id/retry` | Retry failed renewals |

---

## 9. Payments, Discounts & Taxes

| Module | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| Payments | `GET` | `/payments` | Search transaction audit history |
| Payments | `POST` | `/payments/:id/refund` | Refund payment (full or partial) |
| Discounts | `GET` | `/discounts` | List coupons / discount rules |
| Discounts | `POST` | `/discounts` | Create coupon (`PERCENTAGE` or `FLAT`) |
| Discounts | `POST` | `/discounts/validate` | Verify coupon validity & calculate savings |
| Taxes | `GET` | `/taxes` | List GST / VAT rates (`CGST`, `SGST`, `IGST`) |
| Taxes | `POST` | `/taxes/calculate` | Compute applicable taxes for cart total |

---

## 10. PostgreSQL Database Schema

```sql
-- 1. Users & Roles
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'STAFF', 'CUSTOMER')),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    company VARCHAR(150),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers
CREATE TABLE customers (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id),
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
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products & Variants
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_variants (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    attributes JSONB DEFAULT '{}'
);

-- 4. Subscription Plans
CREATE TABLE subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    billing_frequency VARCHAR(20) NOT NULL CHECK (billing_frequency IN ('MONTHLY', 'QUARTERLY', 'ANNUALLY')),
    base_price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    trial_days INT DEFAULT 0,
    setup_fee NUMERIC(12, 2) DEFAULT 0,
    features JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Quotations
CREATE TABLE quotations (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES customers(id),
    plan_id VARCHAR(50) REFERENCES subscription_plans(id),
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL,
    valid_until DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'CONFIRMED', 'CONVERTED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Subscriptions
CREATE TABLE subscriptions (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) REFERENCES customers(id),
    plan_id VARCHAR(50) REFERENCES subscription_plans(id),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED', 'PENDING')),
    billing_frequency VARCHAR(20) NOT NULL,
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,
    amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Invoices & Line Items
CREATE TABLE invoices (
    id VARCHAR(50) PRIMARY KEY,
    subscription_id VARCHAR(50) REFERENCES subscriptions(id),
    customer_id VARCHAR(50) REFERENCES customers(id),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL,
    balance_due NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'CONFIRMED' CHECK (status IN ('DRAFT', 'CONFIRMED', 'PAID', 'OVERDUE', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoice_line_items (
    id VARCHAR(50) PRIMARY KEY,
    invoice_id VARCHAR(50) REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INT DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 18.00,
    amount NUMERIC(12, 2) NOT NULL
);

-- 8. Payments
CREATE TABLE payments (
    id VARCHAR(50) PRIMARY KEY,
    invoice_id VARCHAR(50) REFERENCES invoices(id),
    customer_id VARCHAR(50) REFERENCES customers(id),
    amount NUMERIC(12, 2) NOT NULL,
    method VARCHAR(30) CHECK (method IN ('CARD', 'UPI', 'NETBANKING', 'BANK_TRANSFER', 'AUTO_DEBIT')),
    reference_number VARCHAR(100),
    status VARCHAR(20) DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'PENDING', 'FAILED', 'REFUNDED')),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Discounts & Taxes
CREATE TABLE discounts (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) CHECK (type IN ('PERCENTAGE', 'FLAT')),
    value NUMERIC(10, 2) NOT NULL,
    min_order_amount NUMERIC(12, 2) DEFAULT 0,
    valid_from DATE,
    valid_to DATE,
    max_uses INT,
    times_used INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

CREATE TABLE taxes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    rate NUMERIC(5, 2) NOT NULL,
    type VARCHAR(20) DEFAULT 'PERCENTAGE',
    is_compound BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- 10. Billing Runs
CREATE TABLE billing_runs (
    id VARCHAR(50) PRIMARY KEY,
    run_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'COMPLETED',
    total_subscriptions INT NOT NULL,
    invoices_generated INT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    failed_count INT DEFAULT 0,
    execution_time_seconds NUMERIC(6, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Audit Logs
CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    resource_id VARCHAR(50),
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 11. Role-Based Access Control (RBAC) Summary

| Feature / Module | ADMIN | STAFF | CUSTOMER |
|------------------|:-----:|:-----:|:--------:|
| Overview Dashboard | Full | Full | ❌ (has Portal) |
| Customer Management | Read/Write | Read/Write | ❌ |
| Products & Plans | Read/Write | Read Only | Read Only (Portal) |
| Quotations | Full | Create & View | View & Accept |
| Subscriptions Lifecycle | Full | Full | View & Cancel own |
| Invoices & Payments | Full | Full | View & Pay own |
| Discounts & Coupons | Read/Write | Read Only | ❌ |
| Automated Billing Runs | Execute & Manage | View Only | ❌ |
| Revenue Reports | Full MRR/ARR | Basic Summary | ❌ |
| Team Members / Users | Admin Only | ❌ | ❌ |
| Taxes Configuration | Admin Only | ❌ | ❌ |
| Audit Trail Logs | Admin Only | ❌ | ❌ |
| Company Settings & API Keys | Admin Only | ❌ | ❌ |

