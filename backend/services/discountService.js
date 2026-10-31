// backend/services/discountService.js

import prisma from "../db.js";

export async function createDiscount(data) {
    const {
        name,
        description,
        type,
        value,
        minimumPurchase,
        minimumQuantity = 1,
        startsAt,
        expiresAt,
        usageLimit,
        createdById,
    } = data;

    if (!name || !type || value === undefined || !createdById) {
        throw new Error("name, type, value and createdById are required.");
    }

    if (!["FIXED", "PERCENTAGE"].includes(type)) {
        throw new Error("Discount type must be FIXED or PERCENTAGE.");
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
        throw new Error("Discount value must be greater than zero.");
    }

    if (type === "PERCENTAGE" && numericValue > 100) {
        throw new Error("Percentage discount cannot exceed 100.");
    }

    if (!Number.isInteger(Number(minimumQuantity)) || Number(minimumQuantity) < 1) {
        throw new Error("minimumQuantity must be a positive integer.");
    }

    const parsedStart = startsAt ? new Date(startsAt) : null;
    const parsedExpiry = expiresAt ? new Date(expiresAt) : null;

    if (parsedStart && Number.isNaN(parsedStart.getTime())) {
        throw new Error("Invalid startsAt date.");
    }

    if (parsedExpiry && Number.isNaN(parsedExpiry.getTime())) {
        throw new Error("Invalid expiresAt date.");
    }

    if (parsedStart && parsedExpiry && parsedExpiry <= parsedStart) {
        throw new Error("expiresAt must be later than startsAt.");
    }

    if (
        usageLimit !== undefined &&
        usageLimit !== null &&
        (!Number.isInteger(Number(usageLimit)) || Number(usageLimit) < 1)
    ) {
        throw new Error("usageLimit must be a positive integer.");
    }

    return prisma.discount.create({
        data: {
            name,
            description: description || null,
            type,
            value: numericValue,
            minimumPurchase:
                minimumPurchase === undefined || minimumPurchase === null
                    ? null
                    : Number(minimumPurchase),
            minimumQuantity: Number(minimumQuantity),
            startsAt: parsedStart,
            expiresAt: parsedExpiry,
            usageLimit:
                usageLimit === undefined || usageLimit === null
                    ? null
                    : Number(usageLimit),
            createdById,
        },
    });
}

export async function getDiscounts() {
    return prisma.discount.findMany({
        include: {
            createdBy: {
                select: { id: true, name: true, email: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}

export async function validateDiscount(data) {
    const { discountId, subtotal, quantity = 1 } = data;

    if (!discountId || subtotal === undefined) {
        throw new Error("discountId and subtotal are required.");
    }

    const numericSubtotal = Number(subtotal);
    const numericQuantity = Number(quantity);

    if (!Number.isFinite(numericSubtotal) || numericSubtotal < 0) {
        throw new Error("Subtotal must be a valid non-negative amount.");
    }

    if (!Number.isInteger(numericQuantity) || numericQuantity < 1) {
        throw new Error("Quantity must be a positive integer.");
    }

    const discount = await prisma.discount.findUnique({
        where: { id: discountId },
    });

    if (!discount) {
        throw new Error("Discount not found.");
    }

    const now = new Date();
    const reasons = [];

    if (!discount.isActive) reasons.push("Discount is inactive.");

    if (discount.startsAt && now < discount.startsAt) {
        reasons.push("Discount is not active yet.");
    }

    if (discount.expiresAt && now > discount.expiresAt) {
        reasons.push("Discount has expired.");
    }

    if (
        discount.usageLimit !== null &&
        discount.usageCount >= discount.usageLimit
    ) {
        reasons.push("Discount usage limit has been reached.");
    }

    if (numericQuantity < discount.minimumQuantity) {
        reasons.push("Minimum quantity requirement not met.");
    }

    if (
        discount.minimumPurchase !== null &&
        numericSubtotal < Number(discount.minimumPurchase)
    ) {
        reasons.push("Minimum purchase requirement not met.");
    }

    if (reasons.length > 0) {
        return {
            valid: false,
            reasons,
            discountAmount: 0,
        };
    }

    const discountAmount =
        discount.type === "PERCENTAGE"
            ? numericSubtotal * Number(discount.value) / 100
            : Number(discount.value);

    return {
        valid: true,
        reasons: [],
        discountAmount: Number(
            Math.min(discountAmount, numericSubtotal).toFixed(2)
        ),
        discount: {
            id: discount.id,
            name: discount.name,
            type: discount.type,
            value: Number(discount.value),
        },
    };
}