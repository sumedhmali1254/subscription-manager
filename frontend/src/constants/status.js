// Subscription Statuses & State Machine
export const SUBSCRIPTION_STATUS = {
  DRAFT: 'DRAFT',
  QUOTATION: 'QUOTATION',
  CONFIRMED: 'CONFIRMED',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
};

export const SUBSCRIPTION_STATUS_CONFIG = {
  [SUBSCRIPTION_STATUS.DRAFT]: {
    label: 'Draft',
    variant: 'neutral',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
  [SUBSCRIPTION_STATUS.QUOTATION]: {
    label: 'Quotation',
    variant: 'info',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  [SUBSCRIPTION_STATUS.CONFIRMED]: {
    label: 'Confirmed',
    variant: 'purple',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
  },
  [SUBSCRIPTION_STATUS.ACTIVE]: {
    label: 'Active',
    variant: 'success',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  [SUBSCRIPTION_STATUS.PAUSED]: {
    label: 'Paused',
    variant: 'warning',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  [SUBSCRIPTION_STATUS.CLOSED]: {
    label: 'Closed',
    variant: 'neutral',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  },
  [SUBSCRIPTION_STATUS.CANCELLED]: {
    label: 'Cancelled',
    variant: 'danger',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  [SUBSCRIPTION_STATUS.EXPIRED]: {
    label: 'Expired',
    variant: 'danger',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
  },
};

// Invoice Statuses
export const INVOICE_STATUS = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  PAID: 'PAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
};

export const INVOICE_STATUS_CONFIG = {
  [INVOICE_STATUS.DRAFT]: {
    label: 'Draft',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
  [INVOICE_STATUS.CONFIRMED]: {
    label: 'Confirmed',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  [INVOICE_STATUS.PAID]: {
    label: 'Paid',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  [INVOICE_STATUS.PARTIALLY_PAID]: {
    label: 'Partially Paid',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    dot: 'bg-cyan-500',
  },
  [INVOICE_STATUS.OVERDUE]: {
    label: 'Overdue',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  [INVOICE_STATUS.CANCELLED]: {
    label: 'Cancelled',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  },
};

// Quotation Statuses
export const QUOTATION_STATUS = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  CONFIRMED: 'CONFIRMED',
  CONVERTED: 'CONVERTED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
};

export const QUOTATION_STATUS_CONFIG = {
  [QUOTATION_STATUS.DRAFT]: {
    label: 'Draft',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
  [QUOTATION_STATUS.SENT]: {
    label: 'Sent',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  [QUOTATION_STATUS.CONFIRMED]: {
    label: 'Confirmed',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
  },
  [QUOTATION_STATUS.CONVERTED]: {
    label: 'Converted to Sub',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  [QUOTATION_STATUS.CANCELLED]: {
    label: 'Cancelled',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  [QUOTATION_STATUS.EXPIRED]: {
    label: 'Expired',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
};

// Payment Statuses
export const PAYMENT_STATUS = {
  SUCCESS: 'SUCCESS',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
};

export const PAYMENT_STATUS_CONFIG = {
  [PAYMENT_STATUS.SUCCESS]: {
    label: 'Success',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  [PAYMENT_STATUS.PENDING]: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  [PAYMENT_STATUS.FAILED]: {
    label: 'Failed',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
};

export const PAYMENT_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CARD', label: 'Credit/Debit Card' },
  { value: 'CASH', label: 'Cash' },
  { value: 'OTHER', label: 'Other' },
];

export const BILLING_FREQUENCIES = [
  { value: 'DAILY', label: 'Daily', short: '/day' },
  { value: 'WEEKLY', label: 'Weekly', short: '/wk' },
  { value: 'MONTHLY', label: 'Monthly', short: '/mo' },
  { value: 'YEARLY', label: 'Yearly', short: '/yr' },
];

