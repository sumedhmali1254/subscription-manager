# RECURIX — REST API CONTRACT SPECIFICATION

**Base URL**: `http://localhost:5000/api`  
**Authentication**: Bearer Token (`Authorization: Bearer <JWT_TOKEN>`)  
**Data Format**: JSON (`Content-Type: application/json`)

---

## 1. AUTHENTICATION & SESSIONS

### 1.1 `POST /auth/login`
Authenticates a user and returns a signed JWT token.
- **Request Body**:
```json
{
  "email": "admin@brightloop.io",
  "password": "Password@123",
  "rememberMe": true
}
```
- **Response `200 OK`**:
```json
{
  "user": {
    "id": "USR-001",
    "name": "Sumedh Mali",
    "email": "admin@brightloop.io",
    "role": "ADMIN",
    "status": "ACTIVE",
    "avatar": "https://..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "message": "Login successful"
}
```

### 1.2 `POST /auth/register`
Public registration (creates a `CUSTOMER` role user by default).
- **Request Body**:
```json
{
  "name": "Priya Sharma",
  "email": "priya@acme.com",
  "company": "Acme Technologies Pvt Ltd",
  "password": "Password@123"
}
```

### 1.3 `POST /auth/forgot-password`
Initiates password recovery email.
- **Request Body**: `{"email": "user@brightloop.io"}`

### 1.4 `POST /auth/reset-password`
- **Request Body**: `{"token": "xyz", "newPassword": "NewPassword@123"}`

---

## 2. CUSTOMER MANAGEMENT

### 2.1 `GET /customers`
Retrieves paginated list of customer accounts.
- **Query Params**: `search`, `status` (`ACTIVE` | `INACTIVE`), `page`, `limit`
- **Response `200 OK`**:
```json
{
  "data": [
    {
      "id": "CUST-001",
      "name": "Priya Sharma",
      "company": "Acme Technologies Pvt Ltd",
      "email": "customer@acme.com",
      "phone": "+91 91234 56789",
      "address": "Whitefield, Bengaluru 560066",
      "gstin": "29ABCDE1234F1Z5",
      "totalSubscriptions": 2,
      "activeSubscriptions": 2,
      "totalRevenue": 145000,
      "status": "ACTIVE"
    }
  ],
  "total": 6
}
```

### 2.2 `GET /customers/:id`
Retrieves a single customer profile with linked relations.

### 2.3 `POST /customers`
Creates a customer.
- **Request Body**:
```json
{
  "name": "David Vance",
  "company": "Brightloop Labs UK",
  "email": "david@brightlooplabs.co.uk",
  "phone": "+44 20 7946 0912",
  "address": "22 Bishopsgate, London EC2N 4BQ",
  "gstin": "N/A (Export)",
  "currency": "INR",
  "status": "ACTIVE"
}
```

### 2.4 `PUT /customers/:id`
Updates customer information.

### 2.5 `DELETE /customers/:id`
Archives a customer.

### 2.6 `GET /customers/:id/subscriptions`
Returns all subscriptions belonging to the specified customer.

### 2.7 `GET /customers/:id/invoices`
Returns all invoices issued to the customer.

### 2.8 `GET /customers/:id/payments`
Returns all payments made by the customer.

---

## 3. PRODUCTS & VARIANTS

### 3.1 `GET /products`
- **Query Params**: `search`, `type` (`SERVICE` | `CONSUMABLE` | `STORABLE`)

### 3.2 `POST /products`
Creates a product with nested dynamic variants.
- **Request Body**:
```json
{
  "name": "Business Software Suite",
  "type": "SERVICE",
  "salesPrice": 2000,
  "costPrice": 800,
  "description": "Core subscription operations software",
  "status": "ACTIVE",
  "variants": [
    {
      "name": "Standard Edition",
      "attribute": "Tier",
      "priceAdjustment": 0,
      "status": "ACTIVE"
    },
    {
      "name": "Odoo Brand Edition",
      "attribute": "Tier",
      "priceAdjustment": 560,
      "status": "ACTIVE"
    }
  ]
}
```

---

## 4. SUBSCRIPTION PLANS

### 4.1 `GET /plans`
- **Query Params**: `frequency` (`DAILY` | `WEEKLY` | `MONTHLY` | `YEARLY`)

### 4.2 `POST /plans`
Creates a plan tier.
- **Request Body**:
```json
{
  "name": "Professional Business",
  "description": "Comprehensive recurring billing suite",
  "price": 3999,
  "currency": "INR",
  "billingFrequency": "MONTHLY",
  "minimumQuantity": 1,
  "availableFrom": "2025-01-01",
  "availableUntil": "2028-12-31",
  "autoCloseAtEnd": false,
  "allowEarlyClosure": true,
  "allowPause": true,
  "allowRenewal": true,
  "activeStatus": true,
  "includedProducts": [
    { "productId": "PROD-001", "name": "Business Software Suite", "quantity": 1 }
  ]
}
```

---

## 5. QUOTATIONS & PROPOSALS

### 5.1 `GET /quotations`
- **Query Params**: `status` (`DRAFT` | `SENT` | `CONFIRMED` | `CONVERTED` | `CANCELLED`)

### 5.2 `POST /quotations`
Creates a quotation proposal with line items.

### 5.3 `POST /quotations/:id/send`
Dispatches quotation to the customer's email.

### 5.4 `POST /quotations/:id/confirm`
Customer acceptance of quotation.

### 5.5 `POST /quotations/:id/convert`
**Atomic Workflow**: Converts the confirmed quotation into an active subscription record and updates quotation status to `CONVERTED`.

---

## 6. SUBSCRIPTION LIFECYCLE

### 6.1 `GET /subscriptions`
- **Query Params**: `status` (`DRAFT` | `CONFIRMED` | `ACTIVE` | `PAUSED` | `CLOSED` | `CANCELLED`), `customerId`

### 6.2 `POST /subscriptions`
Directly provisions a new subscription agreement.

### 6.3 `POST /subscriptions/:id/status`
Executes lifecycle state machine transitions (`ACTIVE`, `PAUSED`, `CLOSED`, `CANCELLED`).
- **Request Body**: `{"status": "PAUSED", "reason": "Customer seasonal request"}`

### 6.4 `POST /subscriptions/:id/renew`
Extends contract end date and schedules the next recurring billing cycle.

### 6.5 `POST /subscriptions/:id/add-ons`
Attaches an add-on item to the subscription, dynamically updating recurring line totals.
- **Request Body**: `{"name": "200 GB Extra Cloud Storage", "price": 900}`

### 6.6 `DELETE /subscriptions/:id/add-ons/:addOnId`
Removes attached add-on.

### 6.7 `POST /subscriptions/:id/generate-invoice`
Manually triggers recurring invoice generation for this subscription.

---

## 7. INVOICE MANAGEMENT

### 7.1 `GET /invoices`
- **Query Params**: `status` (`DRAFT` | `CONFIRMED` | `PAID` | `PARTIALLY_PAID` | `OVERDUE` | `CANCELLED`), `customerId`

### 7.2 `POST /invoices`
Creates a manual/one-off invoice.

### 7.3 `POST /invoices/:id/confirm`
Marks draft invoice as issued/confirmed.

### 7.4 `POST /invoices/:id/send`
Sends PDF tax invoice copy to customer email.

### 7.5 `POST /invoices/:id/payments`
**Atomic Workflow**: Records partial or full payment settlement for an invoice. Updates `amount_paid`, `outstanding_balance`, and moves invoice status to `PAID` or `PARTIALLY_PAID`.
- **Request Body**:
```json
{
  "amount": 4318.92,
  "paymentMethod": "UPI",
  "transactionId": "UPI/26100200881/cloudpulse",
  "paymentDate": "2026-10-31",
  "notes": "Direct Razorpay settlement"
}
```

---

## 8. AUTOMATED BILLING RUNS

### 8.1 `GET /billing/runs`
Lists historical automated batch billing executions.

### 8.2 `POST /billing/run`
Executes automated renewal sweep across all active subscriptions reaching `next_billing_date`. Generates invoices, updates `next_billing_date`, and produces a run report.

### 8.3 `POST /billing/runs/:id/retry`
Retries failed invoice charges in batch.

---

## 9. REPORTS & METRICS

### 9.1 `GET /reports/overview?range=30d`
Returns MRR, ARR, Invoiced Volume, Collected Settlements, Outstanding Receivables, Overdue Counts.

### 9.2 `GET /reports/revenue-trends`
Returns monthly array of `{ month, invoiced, collected, mrr }`.

### 9.3 `GET /reports/subscription-growth`
Returns monthly active subscriber counts, new signups, and churn.

### 9.4 `GET /reports/plan-distribution`
Returns revenue and subscriber share by plan tier.

### 9.5 `GET /reports/payment-methods`
Returns payment channel percentages (Bank Transfer, UPI, Card, Cash).

