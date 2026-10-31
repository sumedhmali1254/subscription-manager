// backend/routes/financeRoutes.js

import express from "express";

import {
    createInvoice,
    getInvoices,
    getInvoiceById,
    createPayment,
    getPayments,
    getPaymentsByInvoice,
    createDiscount,
    getDiscounts,
    validateDiscount,
    getFinanceSummary,
} from "../controller/financeController.js";

const router = express.Router();

// Invoice routes
router.post("/invoices", createInvoice);
router.get("/invoices", getInvoices);
router.get("/invoices/:id", getInvoiceById);

// Payment routes
router.post("/payments", createPayment);
router.get("/payments", getPayments);
router.get("/invoices/:invoiceId/payments", getPaymentsByInvoice);

// Discount routes
router.post("/discounts", createDiscount);
router.get("/discounts", getDiscounts);
router.post("/discounts/validate", validateDiscount);

// Finance report
router.get("/summary", getFinanceSummary);

export default router;