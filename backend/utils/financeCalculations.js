// backend/utils/financeCalculations.js

const toPaise = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number) || number < 0) {
        throw new Error("Amount must be a valid non-negative number.");
    }

    return Math.round(number * 100);
};

const fromPaise = (paise) => Number((paise / 100).toFixed(2));

export function calculateInvoiceTotals(lines, discount = null) {
    if (!Array.isArray(lines) || lines.length === 0) {
        throw new Error("An invoice must contain at least one line.");
    }

    let subtotalPaise = 0;
    let taxPaise = 0;

    const calculatedLines = lines.map((line) => {
        const quantity = Number(line.quantity);
        const unitPricePaise = toPaise(line.unitPrice);
        const taxRate = Number(line.taxRate ?? 0);

        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new Error("Line quantity must be a positive integer.");
        }

        if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
            throw new Error("Tax rate must be between 0 and 100.");
        }

        const lineSubtotalPaise = quantity * unitPricePaise;
        const lineTaxPaise = Math.round(lineSubtotalPaise * taxRate / 100);

        subtotalPaise += lineSubtotalPaise;
        taxPaise += lineTaxPaise;

        return {
            ...line,
            quantity,
            unitPrice: fromPaise(unitPricePaise),
            taxRate,
        };
    });

    let discountPaise = 0;

    if (discount) {
        const discountValue = Number(discount.value);

        if (!Number.isFinite(discountValue) || discountValue < 0) {
            throw new Error("Discount value must be non-negative.");
        }

        if (discount.type === "PERCENTAGE") {
            if (discountValue > 100) {
                throw new Error("Percentage discount cannot exceed 100%.");
            }

            discountPaise = Math.round(
                (subtotalPaise + taxPaise) * discountValue / 100
            );
        } else if (discount.type === "FIXED") {
            discountPaise = toPaise(discountValue);
        } else {
            throw new Error("Invalid discount type.");
        }
    }

    discountPaise = Math.min(discountPaise, subtotalPaise + taxPaise);

    return {
        lines: calculatedLines,
        subtotal: fromPaise(subtotalPaise),
        taxAmount: fromPaise(taxPaise),
        discountAmount: fromPaise(discountPaise),
        totalAmount: fromPaise(subtotalPaise + taxPaise - discountPaise),
    };
}