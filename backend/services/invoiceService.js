// backend/services/invoiceService.js

import prisma from "../db.js";
import { calculateInvoiceTotals } from "../utils/financeCalculations.js";
import { generateInvoiceNumber } from "../utils/invoiceNumber.js";

export async function createInvoice(data) {
    const { subscriptionId, dueDate, discountId } = data;

    if (!subscriptionId || !dueDate) {
        throw new Error("subscriptionId and dueDate are required.");
    }

    const parsedDueDate = new Date(dueDate);

    if (Number.isNaN(parsedDueDate.getTime())) {
        throw new Error("Please provide a valid dueDate.");
    }

    const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: {
            customer: true,
            lines: {
                include: {
                    product: true,
                    variant: true,
                },
            },
        },
    });

    if (!subscription) {
        throw new Error("Subscription not found.");
    }

    if (subscription.lines.length === 0) {
        throw new Error("The subscription has no lines to invoice.");
    }

    const lines = subscription.lines.map((line) => ({
        description:
            line.description ||
            `${line.product.name}${line.variant ? ` - ${line.variant.name}` : ""}`,
        quantity: line.quantity,
        unitPrice: Number(line.unitPrice),
        taxRate: 0,
        productId: line.productId,
        variantId: line.variantId,
    }));

    let discount = null;

    if (discountId) {
        discount = await prisma.discount.findUnique({
            where: { id: discountId },
        });

        if (!discount) {
            throw new Error("Discount not found.");
        }

        const now = new Date();

        if (!discount.isActive) {
            throw new Error("This discount is inactive.");
        }

        if (discount.startsAt && now < discount.startsAt) {
            throw new Error("This discount is not active yet.");
        }

        if (discount.expiresAt && now > discount.expiresAt) {
            throw new Error("This discount has expired.");
        }

        if (
            discount.usageLimit !== null &&
            discount.usageCount >= discount.usageLimit
        ) {
            throw new Error("This discount has reached its usage limit.");
        }

        const quantity = lines.reduce((sum, line) => sum + line.quantity, 0);

        if (quantity < discount.minimumQuantity) {
            throw new Error("Minimum quantity requirement not met.");
        }
    }

    const totals = calculateInvoiceTotals(lines, discount);

    if (
        discount?.minimumPurchase !== null &&
        discount?.minimumPurchase !== undefined &&
        totals.subtotal < Number(discount.minimumPurchase)
    ) {
        throw new Error("Minimum purchase requirement not met.");
    }

    return prisma.$transaction(async (tx) => {
        if (discount) {
            const updated = await tx.discount.updateMany({
                where: {
                    id: discount.id,
                    isActive: true,
                    ...(discount.usageLimit !== null
                        ? { usageCount: { lt: discount.usageLimit } }
                        : {}),
                },
                data: { usageCount: { increment: 1 } },
            });

            if (updated.count !== 1) {
                throw new Error("Discount is no longer available.");
            }
        }

        return tx.invoice.create({
            data: {
                invoiceNo: generateInvoiceNumber(),
                status: "CONFIRMED",
                dueDate: parsedDueDate,
                subtotal: totals.subtotal,
                taxAmount: totals.taxAmount,
                discountAmount: totals.discountAmount,
                totalAmount: totals.totalAmount,
                customerId: subscription.customerId,
                subscriptionId: subscription.id,
                discountId: discount?.id ?? null,
                lines: {
                    create: totals.lines.map((line) => ({
                        description: line.description,
                        quantity: line.quantity,
                        unitPrice: line.unitPrice,
                        taxRate: line.taxRate,
                        productId: line.productId,
                        variantId: line.variantId ?? null,
                    })),
                },
            },
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
                lines: true,
                payments: true,
            },
        });
    });
}

export async function getInvoices() {
    return prisma.invoice.findMany({
        include: {
            customer: {
                select: { id: true, name: true, email: true },
            },
            subscription: {
                select: { id: true, subscriptionNo: true },
            },
            lines: true,
            payments: true,
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function getInvoiceById(id) {
    const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
            customer: {
                select: { id: true, name: true, email: true },
            },
            subscription: true,
            discount: true,
            lines: true,
            payments: true,
        },
    });

    if (!invoice) {
        throw new Error("Invoice not found.");
    }

    return invoice;
}