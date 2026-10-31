require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { initDb, isFallback } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const variantRoutes = require('./routes/variantRoutes');
const planRoutes = require('./routes/planRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const quotationTemplateRoutes = require('./routes/quotationTemplateRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const discountRoutes = require('./routes/discountRoutes');
const taxRoutes = require('./routes/taxRoutes');
const billingRoutes = require('./routes/billingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const auditRoutes = require('./routes/auditRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check & Root Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'RECURIX Backend REST API Engine',
    database: isFallback() ? 'In-Memory (Transactional)' : 'MySQL (Connected)',
    timestamp: new Date().toISOString(),
    version: '2.0.0 Master'
  });
});

app.get('/', (req, res) => {
  res.send('RECURIX Enterprise Subscription Billing REST API Server. Health endpoint at /api/health');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/product-variants', variantRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/quotation-templates', quotationTemplateRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/taxes', taxRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/billing-runs', billingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/settings', settingsRoutes);

// 404 Catch-All
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Bootstrapping
async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(` RECURIX Backend API Server successfully launched!`);
    console.log(` Local URL : http://localhost:${PORT}/api`);
    console.log(` Health Check : http://localhost:${PORT}/api/health`);
    console.log(` Database Mode : ${isFallback() ? 'Transactional In-Memory Store' : 'Live MySQL Database'}`);
    console.log(`================================================================`);
  });
}

startServer();

module.exports = app;

