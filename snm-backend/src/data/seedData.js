/**
 * RECURIX Seed Data
 * Matches the frontend data schema and provides realistic minimal data
 */
const bcrypt = require('bcryptjs');

// Pre-hashed password for "Password@123"
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('Password@123', 10);

const SEED_DATA = {
  users: [
    {
      id: 'USR-001',
      name: 'Sarah Jenkins',
      email: 'admin@brightloop.io',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: 'ADMIN',
      status: 'ACTIVE',
      company: 'Brightloop Software Pvt Ltd',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      created_at: '2026-01-10 09:00:00'
    },
    {
      id: 'USR-002',
      name: 'David Vance',
      email: 'staff@brightloop.io',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: 'STAFF',
      status: 'ACTIVE',
      company: 'Brightloop Software Pvt Ltd',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      created_at: '2026-02-15 11:30:00'
    },
    {
      id: 'USR-003',
      name: 'Priya Sharma',
      email: 'customer@acme.com',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      company: 'Acme Technologies Pvt Ltd',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      created_at: '2026-03-01 14:20:00'
    }
  ],

  customers: [
    {
      id: 'CUST-001',
      user_id: 'USR-003',
      name: 'Priya Sharma',
      email: 'customer@acme.com',
      phone: '+91 91234 56789',
      company: 'Acme Technologies Pvt Ltd',
      gstin: '29AABCA1234F1Z5',
      billing_street: '402 Cyber Heights, Outer Ring Road',
      billing_city: 'Bengaluru',
      billing_state: 'Karnataka',
      billing_pincode: '560103',
      billing_country: 'India',
      status: 'ACTIVE',
      active_subscriptions_count: 1,
      total_revenue: 145000.00,
      notes: 'Key enterprise SaaS client.',
      created_at: '2026-01-15 10:00:00'
    },
    {
      id: 'CUST-002',
      user_id: null,
      name: 'Rahul Mehta',
      email: 'rahul@cloudpulse.io',
      phone: '+91 99887 76655',
      company: 'CloudPulse Systems',
      gstin: '27AABCU9603R1ZX',
      billing_street: 'Level 5, BKC Trade Centre',
      billing_city: 'Mumbai',
      billing_state: 'Maharashtra',
      billing_pincode: '400051',
      billing_country: 'India',
      status: 'ACTIVE',
      active_subscriptions_count: 1,
      total_revenue: 48000.00,
      notes: 'B2B Analytics client.',
      created_at: '2026-02-01 11:00:00'
    },
    {
      id: 'CUST-003',
      user_id: null,
      name: 'David Vance',
      email: 'david@brightlooplabs.co.uk',
      phone: '+44 20 7946 0912',
      company: 'Brightloop Labs UK',
      gstin: 'VAT-GB9982341',
      billing_street: '12 Tech Square, Silicon Roundabout',
      billing_city: 'London',
      billing_state: 'Greater London',
      billing_pincode: 'EC1V 1AB',
      billing_country: 'United Kingdom',
      status: 'ACTIVE',
      active_subscriptions_count: 1,
      total_revenue: 280000.00,
      notes: 'International subsidiary client.',
      created_at: '2026-02-15 09:30:00'
    }
  ],

  products: [
    {
      id: 'PROD-001',
      name: 'Cloud Billing Engine',
      code: 'PROD-CLOUD-BILL',
      category: 'Software',
      product_type: 'SaaS Platform',
      sales_price: 4999.00,
      cost_price: 900.00,
      description: 'Enterprise recurring billing, invoice automation and subscription lifecycle API.',
      notes: 'Core billing flagship product.',
      status: 'ACTIVE',
      created_at: '2026-01-05 00:00:00'
    },
    {
      id: 'PROD-002',
      name: 'Usage Metering Service',
      code: 'PROD-METERING',
      category: 'Infrastructure',
      product_type: 'Microservice',
      sales_price: 1999.00,
      cost_price: 400.00,
      description: 'High-throughput event ingestion and metered subscription calculator.',
      notes: 'Addon utility.',
      status: 'ACTIVE',
      created_at: '2026-01-12 00:00:00'
    }
  ],

  product_variants: [
    {
      id: 'VAR-001',
      product_id: 'PROD-001',
      name: '50 GB Cloud Storage Add-on',
      sku: 'SKU-STRG-50G',
      additional_price: 1499.00,
      description: 'High-speed encrypted document storage.',
      status: 'ACTIVE'
    },
    {
      id: 'VAR-002',
      product_id: 'PROD-001',
      name: 'Dedicated Private Tenant VPC',
      sku: 'SKU-VPC-ISO',
      additional_price: 8999.00,
      description: 'Isolated single-tenant database instance with VPN access.',
      status: 'ACTIVE'
    }
  ],

  subscription_plans: [
    {
      id: 'PLAN-001',
      product_id: 'PROD-001',
      name: 'Enterprise Scale Plan',
      code: 'PLAN-ENT-SCALE',
      description: 'Full-featured automated billing with unlimited API webhooks and SLA guarantee.',
      billing_frequency: 'MONTHLY',
      base_price: 14999.00,
      currency: 'INR',
      minimum_quantity: 1,
      start_date: '2026-01-01',
      end_date: '2027-12-31',
      auto_close_on_expiry: true,
      allow_early_closure: true,
      allow_pause: true,
      allow_renewal: true,
      trial_period_days: 14,
      setup_fee: 5000.00,
      features: JSON.stringify(['Unlimited Invoices', 'Multi-currency Support', 'Automated GST Calculation', '24/7 Priority Support', 'Dedicated Account Manager']),
      status: 'ACTIVE',
      created_at: '2026-01-01 00:00:00'
    },
    {
      id: 'PLAN-002',
      product_id: 'PROD-001',
      name: 'Growth SaaS Plan',
      code: 'PLAN-GROWTH',
      description: 'Ideal for scaling startups processing up to 25,000 monthly invoices.',
      billing_frequency: 'MONTHLY',
      base_price: 6999.00,
      currency: 'INR',
      minimum_quantity: 1,
      start_date: '2026-01-01',
      end_date: '2027-12-31',
      auto_close_on_expiry: true,
      allow_early_closure: true,
      allow_pause: true,
      allow_renewal: true,
      trial_period_days: 7,
      setup_fee: 0.00,
      features: JSON.stringify(['Up to 25,000 invoices/month', 'Webhooks & REST API', 'Email notifications', 'Standard SLA']),
      status: 'ACTIVE',
      created_at: '2026-01-02 00:00:00'
    }
  ],

  quotation_templates: [
    {
      id: 'TMPL-001',
      name: 'Standard SaaS Enterprise Quote',
      description: 'Standard 30-day enterprise quote template with 18% GST and Net 15 terms.',
      plan_id: 'PLAN-001',
      payment_terms: 'NET 15',
      validity_days: 30,
      notes: 'Includes standard SLA & uptime guarantees.'
    }
  ],

  quotations: [
    {
      id: 'QTN-001',
      quotation_number: 'QTN-2026-001',
      customer_id: 'CUST-001',
      plan_id: 'PLAN-001',
      template_id: 'TMPL-001',
      quotation_date: '2026-03-01',
      valid_until: '2026-03-31',
      subtotal: 14999.00,
      discount_amount: 1499.90,
      tax_amount: 2429.84,
      total_amount: 15928.94,
      notes: 'Special introductory 10% discount applied.',
      terms: 'Payment due within 15 days of invoice date.',
      status: 'CONFIRMED',
      converted_subscription_id: 'SUB-001',
      created_at: '2026-03-01 10:00:00'
    }
  ],

  quotation_line_items: [
    {
      id: 'QLI-001',
      quotation_id: 'QTN-001',
      product_id: 'PROD-001',
      variant_id: null,
      description: 'Enterprise Scale Plan - Monthly Subscription',
      quantity: 1,
      unit_price: 14999.00,
      discount_pct: 10.00,
      tax_rate: 18.00,
      amount: 13499.10
    }
  ],

  subscriptions: [
    {
      id: 'SUB-001',
      subscription_number: 'SUB-2026-001',
      customer_id: 'CUST-001',
      plan_id: 'PLAN-001',
      quotation_id: 'QTN-001',
      billing_frequency: 'MONTHLY',
      quantity: 1,
      unit_price: 14999.00,
      amount: 14999.00,
      start_date: '2026-03-01',
      current_period_start: '2026-03-01',
      current_period_end: '2026-03-31',
      next_billing_date: '2026-04-01',
      expiry_date: '2027-02-28',
      auto_renew: true,
      status: 'ACTIVE',
      created_at: '2026-03-01 10:30:00'
    },
    {
      id: 'SUB-002',
      subscription_number: 'SUB-2026-002',
      customer_id: 'CUST-002',
      plan_id: 'PLAN-002',
      quotation_id: null,
      billing_frequency: 'MONTHLY',
      quantity: 1,
      unit_price: 6999.00,
      amount: 6999.00,
      start_date: '2026-02-15',
      current_period_start: '2026-02-15',
      current_period_end: '2026-03-14',
      next_billing_date: '2026-03-15',
      expiry_date: '2027-02-14',
      auto_renew: true,
      status: 'ACTIVE',
      created_at: '2026-02-15 11:00:00'
    }
  ],

  invoices: [
    {
      id: 'INV-001',
      invoice_number: 'INV-2026-001',
      subscription_id: 'SUB-001',
      customer_id: 'CUST-001',
      invoice_date: '2026-03-01',
      due_date: '2026-03-15',
      subtotal: 14999.00,
      discount_amount: 1499.90,
      tax_amount: 2429.84,
      total_amount: 15928.94,
      paid_amount: 15928.94,
      outstanding_amount: 0.00,
      status: 'PAID',
      notes: 'Thank you for your business.',
      created_at: '2026-03-01 10:30:00'
    },
    {
      id: 'INV-002',
      invoice_number: 'INV-2026-002',
      subscription_id: 'SUB-002',
      customer_id: 'CUST-002',
      invoice_date: '2026-02-15',
      due_date: '2026-03-01',
      subtotal: 6999.00,
      discount_amount: 0.00,
      tax_amount: 1259.82,
      total_amount: 8258.82,
      paid_amount: 4000.00,
      outstanding_amount: 4258.82,
      status: 'PARTIALLY_PAID',
      notes: 'Partial payment received.',
      created_at: '2026-02-15 11:00:00'
    },
    {
      id: 'INV-003',
      invoice_number: 'INV-2026-003',
      subscription_id: 'SUB-001',
      customer_id: 'CUST-001',
      invoice_date: '2026-04-01',
      due_date: '2026-04-15',
      subtotal: 14999.00,
      discount_amount: 0.00,
      tax_amount: 2699.82,
      total_amount: 17698.82,
      paid_amount: 0.00,
      outstanding_amount: 17698.82,
      status: 'CONFIRMED',
      notes: 'April billing cycle invoice.',
      created_at: '2026-04-01 00:05:00'
    }
  ],

  invoice_line_items: [
    {
      id: 'ILI-001',
      invoice_id: 'INV-001',
      product_id: 'PROD-001',
      description: 'Enterprise Scale Plan - Monthly Subscription (March 2026)',
      quantity: 1,
      unit_price: 14999.00,
      tax_rate: 18.00,
      amount: 14999.00
    },
    {
      id: 'ILI-002',
      invoice_id: 'INV-002',
      product_id: 'PROD-001',
      description: 'Growth SaaS Plan - Monthly Subscription (Feb - Mar 2026)',
      quantity: 1,
      unit_price: 6999.00,
      tax_rate: 18.00,
      amount: 6999.00
    },
    {
      id: 'ILI-003',
      invoice_id: 'INV-003',
      product_id: 'PROD-001',
      description: 'Enterprise Scale Plan - Monthly Subscription (April 2026)',
      quantity: 1,
      unit_price: 14999.00,
      tax_rate: 18.00,
      amount: 14999.00
    }
  ],

  payments: [
    {
      id: 'PAY-001',
      payment_number: 'PAY-2026-001',
      invoice_id: 'INV-001',
      customer_id: 'CUST-001',
      amount: 15928.94,
      method: 'UPI',
      reference_number: 'UPI/20260301/99812481',
      status: 'SUCCESS',
      notes: 'Settled via Google Pay / UPI.',
      payment_date: '2026-03-01 11:15:00'
    },
    {
      id: 'PAY-002',
      payment_number: 'PAY-2026-002',
      invoice_id: 'INV-002',
      customer_id: 'CUST-002',
      amount: 4000.00,
      method: 'BANK_TRANSFER',
      reference_number: 'NEFT-HDFC-9912084',
      status: 'SUCCESS',
      notes: 'First installment received.',
      payment_date: '2026-02-20 15:30:00'
    }
  ],

  discounts: [
    {
      id: 'DISC-001',
      name: 'Launch Promotional 10%',
      code: 'LAUNCH10',
      discount_type: 'PERCENTAGE',
      value: 10.00,
      minimum_quantity: 1,
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      maximum_usage: 100,
      usage_count: 5,
      status: 'ACTIVE'
    },
    {
      id: 'DISC-002',
      name: 'Flat Enterprise Welcome ₹2,000 Off',
      code: 'WELCOME2000',
      discount_type: 'FIXED',
      value: 2000.00,
      minimum_quantity: 1,
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      maximum_usage: 50,
      usage_count: 2,
      status: 'ACTIVE'
    }
  ],

  taxes: [
    {
      id: 'TAX-001',
      name: 'GST - Standard Goods & Services (18%)',
      rate: 18.00,
      type: 'PERCENTAGE',
      is_compound: false,
      status: 'ACTIVE'
    },
    {
      id: 'TAX-002',
      name: 'IGST - Integrated GST (18%)',
      rate: 18.00,
      type: 'PERCENTAGE',
      is_compound: false,
      status: 'ACTIVE'
    }
  ],

  billing_runs: [
    {
      id: 'BRUN-001',
      run_date: '2026-04-01',
      status: 'COMPLETED',
      total_subscriptions: 2,
      invoices_generated: 1,
      total_amount: 17698.82,
      failed_count: 0,
      execution_time_seconds: 1.45,
      error_summary: JSON.stringify([])
    }
  ],

  audit_logs: [
    {
      id: 'LOG-001',
      user_id: 'USR-001',
      user_name: 'Sarah Jenkins',
      action: 'SYSTEM_BOOT',
      resource: 'SYSTEM',
      resource_id: 'SYS-001',
      details: JSON.stringify({ message: 'RECURIX Engine Initialized' }),
      ip_address: '127.0.0.1',
      created_at: '2026-04-01 00:00:00'
    }
  ],

  company_settings: {
    id: 'COMP-001',
    company_name: 'Brightloop Software Pvt Ltd',
    email: 'billing@brightloop.io',
    phone: '+91 80 4123 4567',
    currency: 'INR',
    currency_symbol: '₹',
    timezone: 'Asia/Kolkata',
    gstin: '29AABCB1234F1Z0',
    street: '402 Cyber Heights, Outer Ring Road, Bellandur',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    country: 'India',
    logo_url: ''
  }
};

module.exports = { SEED_DATA };

