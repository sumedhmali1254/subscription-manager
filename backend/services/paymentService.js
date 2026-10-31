// backend/services/paymentService.js

import prisma from "../db.js";

export async function createPayment(data) {
    const {
        invoiceId,
        amount,
        paymentMethod,
        transactionRef,
        note,
        paymentDate,
    } = data;

    if (!invoiceId || !amount || !paymentMethod) {
        throw new Error("invoiceId, amount and paymentMethod are required.");
    }

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
        throw new Error("Payment amount must be greater than zero.");
    }

    const allowedMethods = [
        "CASH",
        "BANK_TRANSFER",
        "CARD",
        "UPI",
        "OTHER",
    ];

    if (!allowedMethods.includes(paymentMethod)) {
        throw new Error("Invalid payment method.");
    }

    const parsedPaymentDate = paymentDate
        ? new Date(paymentDate)
        : new Date();

    if (Number.isNaN(parsedPaymentDate.getTime())) {
        throw new Error("Invalid payment date.");
    }

    return prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.findUnique({
            where: { id: invoiceId },
            include: { payments: true },
        });

        if (!invoice) {
            throw new Error("Invoice not found.");
        }

        if (["CANCELLED", "PAID"].includes(invoice.status)) {
            throw new Error("This invoice cannot receive another payment.");
        }

        const alreadyPaid = invoice.payments.reduce(
            (total, payment) => total + Number(payment.amount),
            0
        );

        const outstanding = Number(invoice.totalAmount) - alreadyPaid;

        if (paymentAmount > outstanding + 0.001) {
            throw new Error(
                `Payment exceeds the outstanding balance of ${outstanding.toFixed(2)}.`
            );
        }

        const payment = await tx.payment.create({
            data: {
                invoiceId,
                amount: paymentAmount,
                paymentMethod,
                transactionRef: transactionRef || null,
                note: note || null,
                paymentDate: parsedPaymentDate,
            },
        });

        const newPaidTotal = alreadyPaid + paymentAmount;
        const isFullyPaid =
            newPaidTotal >= Number(invoice.totalAmount) - 0.001;

        if (isFullyPaid) {
            await tx.invoice.update({
                where: { id: invoiceId },
                data: {
                    status: "PAID",
                    paidAt: parsedPaymentDate,
                },
            });
        }

        return {
            payment,
            totalAmount: Number(invoice.totalAmount),
            paidAmount: Number(newPaidTotal.toFixed(2)),
            outstandingAmount: Number(
                Math.max(0, Number(invoice.totalAmount) - newPaidTotal).toFixed(2)
            ),
            invoiceStatus: isFullyPaid ? "PAID" : invoice.status,
        };
    });
}

export async function getPayments() {
    return prisma.payment.findMany({
        include: {
            invoice: {
                select: {
                    id: true,
                    invoiceNo: true,
                    totalAmount: true,
                    status: true,
                },
            },
        },
        orderBy: { paymentDate: "desc" },
    });
}

export async function getPaymentsByInvoice(invoiceId) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
    });

    if (!invoice) {
        throw new Error("Invoice not found.");
    }

    return prisma.payment.findMany({
        where: { invoiceId },
        orderBy: { paymentDate: "desc" },
    });
}