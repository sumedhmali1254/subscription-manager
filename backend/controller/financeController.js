// backend/controller/financeController.js

import * as invoiceService from "../services/invoiceService.js";
import * as paymentService from "../services/paymentService.js";
import * as discountService from "../services/discountService.js";
import * as reportService from "../services/financeReportService.js";

function handleError(res, error) {
    console.error("Finance API error:", error);

    const message = error.message || "Internal server error";

    const statusCode =
        message.includes("not found") ? 404 :
            message.includes("required") ||
                message.includes("Invalid") ||
                message.includes("must") ||
                message.includes("cannot") ||
                message.includes("exceeds") ||
                message.includes("expired") ||
                message.includes("inactive") ||
                message.includes("available") ||
                message.includes("requirement") ? 400 : 500;

    return res.status(statusCode).json({
        success: false,
        message,
    });
}

export async function createInvoice(req, res) {
    try {
        const invoice = await invoiceService.createInvoice(req.body);

        return res.status(201).json({
            success: true,
            message: "Invoice created successfully.",
            data: invoice,
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function getInvoices(req, res) {
    try {
        const invoices = await invoiceService.getInvoices();

        return res.json({
            success: true,
            count: invoices.length,
            data: invoices,
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function getInvoiceById(req, res) {
    try {
        const invoice = await invoiceService.getInvoiceById(req.params.id);

        return res.json({
            success: true,
            data: invoice,
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function createPayment(req, res) {
    try {
        const result = await paymentService.createPayment(req.body);

        return res.status(201).json({
            success: true,
            message: "Payment recorded successfully.",
            data: result,
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function getPayments(req, res) {
    try {
        const payments = await paymentService.getPayments();

        return res.json({
            success: true,
            count: payments.length,
            data: payments,
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function getPaymentsByInvoice(req, res) {
    try {
        const payments = await paymentService.getPaymentsByInvoice(
            req.params.invoiceId
        );

        return res.json({
            success: true,
            count: payments.length,
            data: payments,
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function createDiscount(req, res) {
    try {
        const discount = await discountService.createDiscount(req.body);

        return res.status(201).json({
            success: true,
            message: "Discount created successfully.",
            data: discount,
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function getDiscounts(req, res) {
    try {
        const discounts = await discountService.getDiscounts();

        return res.json({
            success: true,
            count: discounts.length,
            data: discounts,
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function validateDiscount(req, res) {
    try {
        const result = await discountService.validateDiscount(req.body);

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function getFinanceSummary(req, res) {
    try {
        const summary = await reportService.getFinanceSummary();

        return res.json({
            success: true,
            data: summary,
        });
    } catch (error) {
        return handleError(res, error);
    }
}