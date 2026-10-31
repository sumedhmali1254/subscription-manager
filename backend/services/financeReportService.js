// backend/services/financeReportService.js

import prisma from "../db.js";

export async function getFinanceSummary() {
    const [
        invoices,
        payments,
        totalInvoices,
        paidInvoices,
        overdueInvoices,
        draftInvoices,
    ] = await Promise.all([
        prisma.invoice.findMany({
            select: {
                totalAmount: true,
                status: true,
                dueDate: true,
            },
        }),
        prisma.payment.findMany({
            select: { amount: true },
        }),
        prisma.invoice.count(),
        prisma.invoice.count({ where: { status: "PAID" } }),
        prisma.invoice.count({
            where: {
                status: { in: ["CONFIRMED", "OVERDUE"] },
                dueDate: { lt: new Date() },
            },
        }),
        prisma.invoice.count({ where: { status: "DRAFT" } }),
    ]);

    const totalInvoiced = invoices.reduce(
        (sum, invoice) => sum + Number(invoice.totalAmount),
        0
    );

    const totalCollected = payments.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
    );

    const outstandingAmount = invoices
        .filter((invoice) => invoice.status !== "CANCELLED")
        .reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0)
        - totalCollected;

    return {
        totalInvoices,
        paidInvoices,
        overdueInvoices,
        draftInvoices,
        totalInvoiced: Number(totalInvoiced.toFixed(2)),
        totalCollected: Number(totalCollected.toFixed(2)),
        outstandingAmount: Number(Math.max(0, outstandingAmount).toFixed(2)),
    };
}