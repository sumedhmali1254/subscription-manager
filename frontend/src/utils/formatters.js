import { format, parseISO, isValid } from 'date-fns';

/**
 * Format currency with default Indian Rupee (₹) or given currency code
 */
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0.00';
  }

  const num = Number(amount);
  
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(num);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Format date nicely
 */
export const formatDate = (dateInput, formatStr = 'dd MMM yyyy') => {
  if (!dateInput) return '—';
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
    if (!isValid(date)) return '—';
    return format(date, formatStr);
  } catch (err) {
    return '—';
  }
};

/**
 * Format date and time
 */
export const formatDateTime = (dateInput) => {
  return formatDate(dateInput, 'dd MMM yyyy, hh:mm a');
};

/**
 * Format percentage
 */
export const formatPercentage = (value) => {
  if (value === undefined || value === null) return '0%';
  const num = Number(value);
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(1)}%`;
};

/**
 * Format compact numbers (e.g. 1.2k, 2.5M)
 */
export const formatCompactNumber = (num) => {
  if (!num) return '0';
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(num);
};

