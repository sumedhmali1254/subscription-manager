// backend/utils/invoiceNumber.js

import crypto from "node:crypto";

export function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();

    return `INV-${year}${month}${day}-${randomPart}`;
}