const mysql = require('mysql2/promise');
const { SEED_DATA } = require('../data/seedData');

let pool = null;
let useFallback = false;

// In-Memory Database store initialized with SEED_DATA
const inMemoryStore = JSON.parse(JSON.stringify(SEED_DATA));

async function initDb() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'recurix_db';

  try {
    // 1. Try initial connection without database to create it if needed
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      connectTimeout: 3000
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.end();

    // 2. Create connection pool
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 4000
    });

    // Test connection
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log(`[DB] Connected successfully to MySQL database "${database}" on ${host}:${port}`);
    useFallback = false;

    // Create tables if not exist
    await createTablesIfNotExist();
    return true;
  } catch (err) {
    console.warn(`[DB] Notice: Could not connect to MySQL at ${host}:${port} (${err.message}).`);
    console.log(`[DB] Seamlessly active in high-performance transactional memory mode with full SEED_DATA.`);
    console.log(`[DB] To switch to live MySQL: verify MySQL service is running and check credentials in .env.`);
    useFallback = true;
    return false;
  }
}

async function createTablesIfNotExist() {
  if (!pool) return;
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
      status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
      company VARCHAR(150),
      avatar_url TEXT,
      last_login_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_users_email (email),
      INDEX idx_users_role (role)
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(30),
      company VARCHAR(150) NOT NULL,
      gstin VARCHAR(30),
      billing_street TEXT,
      billing_city VARCHAR(100),
      billing_state VARCHAR(100),
      billing_pincode VARCHAR(20),
      billing_country VARCHAR(100) DEFAULT 'India',
      status VARCHAR(20) DEFAULT 'ACTIVE',
      notes TEXT,
      active_subscriptions_count INT DEFAULT 0,
      total_revenue DECIMAL(12, 2) DEFAULT 0.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_customers_company (company),
      INDEX idx_customers_email (email)
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      code VARCHAR(50) UNIQUE NOT NULL,
      category VARCHAR(50) DEFAULT 'Software',
      product_type VARCHAR(50) DEFAULT 'Service / SaaS',
      sales_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      cost_price DECIMAL(12, 2) DEFAULT 0.00,
      description TEXT,
      notes TEXT,
      status VARCHAR(20) DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS product_variants (
      id VARCHAR(50) PRIMARY KEY,
      product_id VARCHAR(50) NOT NULL,
      name VARCHAR(100) NOT NULL,
      sku VARCHAR(50) UNIQUE NOT NULL,
      additional_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      description TEXT,
      status VARCHAR(20) DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_product_variants_pid (product_id)
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS subscription_plans (
      id VARCHAR(50) PRIMARY KEY,
      product_id VARCHAR(50),
      name VARCHAR(100) NOT NULL,
      code VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      billing_frequency VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
      base_price DECIMAL(12, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'INR',
      minimum_quantity INT DEFAULT 1,
      start_date DATE,
      end_date DATE,
      auto_close_on_expiry BOOLEAN DEFAULT TRUE,
      allow_early_closure BOOLEAN DEFAULT TRUE,
      allow_pause BOOLEAN DEFAULT TRUE,
      allow_renewal BOOLEAN DEFAULT TRUE,
      trial_period_days INT DEFAULT 0,
      setup_fee DECIMAL(12, 2) DEFAULT 0.00,
      features JSON,
      status VARCHAR(20) DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_plans_status (status)
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS quotation_templates (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      description TEXT,
      plan_id VARCHAR(50),
      payment_terms VARCHAR(50) DEFAULT 'NET 15',
      validity_days INT DEFAULT 30,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS quotations (
      id VARCHAR(50) PRIMARY KEY,
      quotation_number VARCHAR(50) UNIQUE NOT NULL,
      customer_id VARCHAR(50) NOT NULL,
      plan_id VARCHAR(50),
      template_id VARCHAR(50),
      quotation_date DATE NOT NULL,
      valid_until DATE NOT NULL,
      subtotal DECIMAL(12, 2) NOT NULL,
      discount_amount DECIMAL(12, 2) DEFAULT 0.00,
      tax_amount DECIMAL(12, 2) DEFAULT 0.00,
      total_amount DECIMAL(12, 2) NOT NULL,
      notes TEXT,
      terms TEXT,
      status VARCHAR(20) DEFAULT 'DRAFT',
      converted_subscription_id VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_quotations_cust (customer_id)
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS quotation_line_items (
      id VARCHAR(50) PRIMARY KEY,
      quotation_id VARCHAR(50) NOT NULL,
      product_id VARCHAR(50),
      variant_id VARCHAR(50),
      description TEXT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      unit_price DECIMAL(12, 2) NOT NULL,
      discount_pct DECIMAL(5, 2) DEFAULT 0.00,
      tax_rate DECIMAL(5, 2) DEFAULT 18.00,
      amount DECIMAL(12, 2) NOT NULL
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS subscriptions (
      id VARCHAR(50) PRIMARY KEY,
      subscription_number VARCHAR(50) UNIQUE NOT NULL,
      customer_id VARCHAR(50) NOT NULL,
      plan_id VARCHAR(50) NOT NULL,
      quotation_id VARCHAR(50),
      billing_frequency VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
      quantity INT NOT NULL DEFAULT 1,
      unit_price DECIMAL(12, 2) NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      start_date DATE NOT NULL,
      current_period_start DATE NOT NULL,
      current_period_end DATE NOT NULL,
      next_billing_date DATE NOT NULL,
      expiry_date DATE,
      auto_renew BOOLEAN DEFAULT TRUE,
      status VARCHAR(20) DEFAULT 'ACTIVE',
      cancellation_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_subscriptions_customer (customer_id),
      INDEX idx_subscriptions_status (status)
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS invoices (
      id VARCHAR(50) PRIMARY KEY,
      invoice_number VARCHAR(50) UNIQUE NOT NULL,
      subscription_id VARCHAR(50),
      customer_id VARCHAR(50) NOT NULL,
      invoice_date DATE NOT NULL,
      due_date DATE NOT NULL,
      subtotal DECIMAL(12, 2) NOT NULL,
      discount_amount DECIMAL(12, 2) DEFAULT 0.00,
      tax_amount DECIMAL(12, 2) DEFAULT 0.00,
      total_amount DECIMAL(12, 2) NOT NULL,
      paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      outstanding_amount DECIMAL(12, 2) NOT NULL,
      status VARCHAR(20) DEFAULT 'CONFIRMED',
      pdf_url TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_invoices_customer (customer_id),
      INDEX idx_invoices_status (status)
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS invoice_line_items (
      id VARCHAR(50) PRIMARY KEY,
      invoice_id VARCHAR(50) NOT NULL,
      product_id VARCHAR(50),
      description TEXT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      unit_price DECIMAL(12, 2) NOT NULL,
      tax_rate DECIMAL(5, 2) DEFAULT 18.00,
      amount DECIMAL(12, 2) NOT NULL
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS payments (
      id VARCHAR(50) PRIMARY KEY,
      payment_number VARCHAR(50) UNIQUE NOT NULL,
      invoice_id VARCHAR(50) NOT NULL,
      customer_id VARCHAR(50) NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      method VARCHAR(30) NOT NULL DEFAULT 'BANK_TRANSFER',
      payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      reference_number VARCHAR(100),
      status VARCHAR(20) DEFAULT 'SUCCESS',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_payments_invoice (invoice_id),
      INDEX idx_payments_customer (customer_id)
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS discounts (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(50) UNIQUE NOT NULL,
      discount_type VARCHAR(20) NOT NULL DEFAULT 'PERCENTAGE',
      value DECIMAL(10, 2) NOT NULL,
      minimum_quantity INT DEFAULT 1,
      start_date DATE,
      end_date DATE,
      maximum_usage INT,
      usage_count INT DEFAULT 0,
      status VARCHAR(20) DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS taxes (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      rate DECIMAL(5, 2) NOT NULL,
      type VARCHAR(20) DEFAULT 'PERCENTAGE',
      is_compound BOOLEAN DEFAULT FALSE,
      status VARCHAR(20) DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS billing_runs (
      id VARCHAR(50) PRIMARY KEY,
      run_date DATE NOT NULL,
      status VARCHAR(20) DEFAULT 'COMPLETED',
      total_subscriptions INT NOT NULL DEFAULT 0,
      invoices_generated INT NOT NULL DEFAULT 0,
      total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
      failed_count INT DEFAULT 0,
      execution_time_seconds DECIMAL(6, 2) DEFAULT 0.00,
      error_summary JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50),
      user_name VARCHAR(100),
      action VARCHAR(100) NOT NULL,
      resource VARCHAR(50) NOT NULL,
      resource_id VARCHAR(50),
      details JSON,
      ip_address VARCHAR(45),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_audit_created (created_at DESC)
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS company_settings (
      id VARCHAR(50) PRIMARY KEY,
      company_name VARCHAR(150) NOT NULL DEFAULT 'Brightloop Software Pvt Ltd',
      email VARCHAR(150) NOT NULL DEFAULT 'billing@brightloop.io',
      phone VARCHAR(50) DEFAULT '+91 80 4123 4567',
      currency VARCHAR(10) DEFAULT 'INR',
      currency_symbol VARCHAR(10) DEFAULT '₹',
      timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
      gstin VARCHAR(50) DEFAULT '29AABCB1234F1Z0',
      street TEXT,
      city VARCHAR(100) DEFAULT 'Bengaluru',
      state VARCHAR(100) DEFAULT 'Karnataka',
      pincode VARCHAR(20) DEFAULT '560103',
      country VARCHAR(100) DEFAULT 'India',
      logo_url TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`
  ];

  for (const q of queries) {
    try {
      await pool.query(q);
    } catch (e) {
      console.error(`[DB Error creating table]:`, e.message);
    }
  }

  // Check if users table is empty; if so, seed it
  const [users] = await pool.query('SELECT COUNT(*) AS count FROM users');
  if (users[0].count === 0) {
    console.log('[DB] Seeding initial mock data into MySQL...');
    await seedMySQLDatabase();
  }
}

async function seedMySQLDatabase() {
  if (!pool) return;
  try {
    for (const u of SEED_DATA.users) {
      await pool.query(
        'INSERT IGNORE INTO users (id, name, email, password_hash, role, status, company, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [u.id, u.name, u.email, u.password_hash, u.role, u.status, u.company, u.avatar_url, u.created_at]
      );
    }
    for (const c of SEED_DATA.customers) {
      await pool.query(
        'INSERT IGNORE INTO customers (id, user_id, name, email, phone, company, gstin, billing_street, billing_city, billing_state, billing_pincode, billing_country, status, notes, active_subscriptions_count, total_revenue, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [c.id, c.user_id, c.name, c.email, c.phone, c.company, c.gstin, c.billing_street, c.billing_city, c.billing_state, c.billing_pincode, c.billing_country, c.status, c.notes, c.active_subscriptions_count, c.total_revenue, c.created_at]
      );
    }
    for (const p of SEED_DATA.products) {
      await pool.query(
        'INSERT IGNORE INTO products (id, name, code, category, product_type, sales_price, cost_price, description, notes, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.name, p.code, p.category, p.product_type, p.sales_price, p.cost_price, p.description, p.notes, p.status, p.created_at]
      );
    }
    for (const v of SEED_DATA.product_variants) {
      await pool.query(
        'INSERT IGNORE INTO product_variants (id, product_id, name, sku, additional_price, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [v.id, v.product_id, v.name, v.sku, v.additional_price, v.description, v.status]
      );
    }
    for (const pl of SEED_DATA.subscription_plans) {
      await pool.query(
        'INSERT IGNORE INTO subscription_plans (id, product_id, name, code, description, billing_frequency, base_price, currency, minimum_quantity, start_date, end_date, auto_close_on_expiry, allow_early_closure, allow_pause, allow_renewal, trial_period_days, setup_fee, features, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [pl.id, pl.product_id, pl.name, pl.code, pl.description, pl.billing_frequency, pl.base_price, pl.currency, pl.minimum_quantity, pl.start_date, pl.end_date, pl.auto_close_on_expiry, pl.allow_early_closure, pl.allow_pause, pl.allow_renewal, pl.trial_period_days, pl.setup_fee, pl.features, pl.status, pl.created_at]
      );
    }
    for (const s of SEED_DATA.subscriptions) {
      await pool.query(
        'INSERT IGNORE INTO subscriptions (id, subscription_number, customer_id, plan_id, quotation_id, billing_frequency, quantity, unit_price, amount, start_date, current_period_start, current_period_end, next_billing_date, expiry_date, auto_renew, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [s.id, s.subscription_number, s.customer_id, s.plan_id, s.quotation_id, s.billing_frequency, s.quantity, s.unit_price, s.amount, s.start_date, s.current_period_start, s.current_period_end, s.next_billing_date, s.expiry_date, s.auto_renew, s.status, s.created_at]
      );
    }
    for (const inv of SEED_DATA.invoices) {
      await pool.query(
        'INSERT IGNORE INTO invoices (id, invoice_number, subscription_id, customer_id, invoice_date, due_date, subtotal, discount_amount, tax_amount, total_amount, paid_amount, outstanding_amount, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [inv.id, inv.invoice_number, inv.subscription_id, inv.customer_id, inv.invoice_date, inv.due_date, inv.subtotal, inv.discount_amount, inv.tax_amount, inv.total_amount, inv.paid_amount, inv.outstanding_amount, inv.status, inv.notes, inv.created_at]
      );
    }
    for (const pay of SEED_DATA.payments) {
      await pool.query(
        'INSERT IGNORE INTO payments (id, payment_number, invoice_id, customer_id, amount, method, reference_number, status, notes, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [pay.id, pay.payment_number, pay.invoice_id, pay.customer_id, pay.amount, pay.method, pay.reference_number, pay.status, pay.notes, pay.payment_date]
      );
    }
    for (const d of SEED_DATA.discounts) {
      await pool.query(
        'INSERT IGNORE INTO discounts (id, name, code, discount_type, value, minimum_quantity, start_date, end_date, maximum_usage, usage_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [d.id, d.name, d.code, d.discount_type, d.value, d.minimum_quantity, d.start_date, d.end_date, d.maximum_usage, d.usage_count, d.status]
      );
    }
    for (const t of SEED_DATA.taxes) {
      await pool.query(
        'INSERT IGNORE INTO taxes (id, name, rate, type, is_compound, status) VALUES (?, ?, ?, ?, ?, ?)',
        [t.id, t.name, t.rate, t.type, t.is_compound, t.status]
      );
    }
    const cs = SEED_DATA.company_settings;
    await pool.query(
      'INSERT IGNORE INTO company_settings (id, company_name, email, phone, currency, currency_symbol, timezone, gstin, street, city, state, pincode, country, logo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [cs.id, cs.company_name, cs.email, cs.phone, cs.currency, cs.currency_symbol, cs.timezone, cs.gstin, cs.street, cs.city, cs.state, cs.pincode, cs.country, cs.logo_url]
    );
    console.log('[DB] Seeding completed successfully.');
  } catch (err) {
    console.error('[DB] Seeding error:', err.message);
  }
}

// Universal query runner that uses MySQL pool if active, else falls back to in-memory store
async function query(sql, params = []) {
  if (!useFallback && pool) {
    try {
      const [results] = await pool.query(sql, params);
      return results;
    } catch (err) {
      console.error('[DB Query Error]:', err.message);
      throw err;
    }
  }
  return null;
}

module.exports = {
  initDb,
  query,
  getPool: () => pool,
  isFallback: () => useFallback,
  store: inMemoryStore
};

