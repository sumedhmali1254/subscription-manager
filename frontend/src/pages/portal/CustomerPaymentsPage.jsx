import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customerService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/tables/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const CustomerPaymentsPage = () => {
  const { user } = useAuth();
  const customerId = user?.customerId || 'CUST-001';

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerService.getCustomerPayments(customerId).then(res => {
      setPayments(res.data);
      setLoading(false);
    });
  }, [customerId]);

  const columns = [
    {
      key: 'paymentReference',
      header: 'Receipt #',
      sortable: true,
      render: (val) => <span className="font-mono font-bold text-[#5263D9]">{val}</span>,
    },
    {
      key: 'invoiceNumber',
      header: 'Settled Invoice',
      sortable: true,
      render: (val) => <span className="font-mono text-slate-700">{val}</span>,
    },
    {
      key: 'paymentDate',
      header: 'Date',
      sortable: true,
      render: (val) => <span className="text-slate-600">{formatDate(val)}</span>,
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      sortable: true,
      render: (val) => <span className="font-medium text-slate-700">{val}</span>,
    },
    {
      key: 'transactionId',
      header: 'UTR / Transaction Ref',
      sortable: true,
      render: (val) => <span className="font-mono text-slate-600 text-[11px]">{val || '—'}</span>,
    },
    {
      key: 'amount',
      header: 'Amount Paid',
      sortable: true,
      render: (val) => <span className="font-bold text-emerald-600 font-heading">{formatCurrency(val)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} type="payment" />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment History"
        subtitle="Receipt register of all verified credit settlements and recurring subscription payments."
      />

      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        searchPlaceholder="Search receipts..."
        exportFilename="my_payments"
      />
    </div>
  );
};

