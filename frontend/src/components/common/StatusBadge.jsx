import React from 'react';
import {
  SUBSCRIPTION_STATUS_CONFIG,
  INVOICE_STATUS_CONFIG,
  QUOTATION_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from '../../constants/status';

export const StatusBadge = ({ status, type = 'subscription', className = '' }) => {
  if (!status) return null;

  let config = null;

  if (type === 'subscription') {
    config = SUBSCRIPTION_STATUS_CONFIG[status];
  } else if (type === 'invoice') {
    config = INVOICE_STATUS_CONFIG[status];
  } else if (type === 'quotation') {
    config = QUOTATION_STATUS_CONFIG[status];
  } else if (type === 'payment') {
    config = PAYMENT_STATUS_CONFIG[status];
  }

  if (!config) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        {status}
      </span>
    );
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border
        ${config.bg} ${config.text} ${config.border}
        ${className}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      {config.label || status}
    </span>
  );
};

