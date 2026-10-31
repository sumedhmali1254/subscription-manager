/**
 * Financial Calculation Helpers
 * Implements standard Indian GST (18%) and Discount rules
 */

function calculateLineItem(quantity, unitPrice, discountPct = 0, taxRate = 18.0) {
  const qty = Number(quantity) || 1;
  const price = Number(unitPrice) || 0;
  const discPct = Number(discountPct) || 0;
  const tax = Number(taxRate) || 18.0;

  const rawAmount = qty * price;
  const discountAmount = Number(((rawAmount * discPct) / 100).toFixed(2));
  const taxableAmount = Math.max(0, rawAmount - discountAmount);
  const taxAmount = Number(((taxableAmount * tax) / 100).toFixed(2));
  const totalAmount = Number((taxableAmount + taxAmount).toFixed(2));

  return {
    rawAmount: Number(rawAmount.toFixed(2)),
    discountAmount,
    taxableAmount,
    taxAmount,
    totalAmount
  };
}

function calculateInvoiceTotals(lineItems = [], discount = null, taxRate = 18.0) {
  let subtotal = 0;
  for (const item of lineItems) {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice || item.unit_price) || 0;
    subtotal += qty * price;
  }
  subtotal = Number(subtotal.toFixed(2));

  let discountAmount = 0;
  if (discount) {
    if (discount.discount_type === 'PERCENTAGE' || discount.type === 'PERCENTAGE') {
      discountAmount = Number(((subtotal * Number(discount.value)) / 100).toFixed(2));
    } else {
      discountAmount = Math.min(subtotal, Number(discount.value) || 0);
    }
  }

  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number(((taxableBase * (Number(taxRate) || 18.0)) / 100).toFixed(2));
  const cgst = Number((taxAmount / 2).toFixed(2));
  const sgst = Number((taxAmount / 2).toFixed(2));
  const grandTotal = Number((taxableBase + taxAmount).toFixed(2));

  return {
    subtotal,
    discountAmount,
    taxableBase,
    taxAmount,
    cgst,
    sgst,
    grandTotal
  };
}

module.exports = {
  calculateLineItem,
  calculateInvoiceTotals
};

