import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/tables/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CreditCard, Building, Calendar, Hash, ArrowUpRight } from 'lucide-react';

export const PaymentListPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('ALL');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentService.getAll({ method: methodFilter });
      setPayments(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [methodFilter]);

  const columns = [
    {
      key: 'paymentReference',
      header: 'Payment Ref',
      sortable: true,
      render: (val) => <span className="font-mono font-bold text-[#5263D9]">{val}</span>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      sortable: true,
      render: (_, row) => (
        <div>
          <div className="font-semibold text-[#202744]">{row.customerName}</div>
          <div className="text-[11px] text-[#64748B] flex items-center gap-1">
            <Building className="w-3 h-3 text-slate-400" />
            <span>{row.customerCompany}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'invoiceNumber',
      header: 'Allocated Invoice',
      sortable: true,
      render: (val, row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/invoices/${row.invoiceId}`);
          }}
          className="font-mono text-[#5263D9] hover:underline font-semibold flex items-center gap-1"
        >
          <span>{val}</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      sortable: true,
      render: (val) => (
        <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 text-slate-700">
          {val}
        </span>
      ),
    },
    {
      key: 'transactionId',
      header: 'UTR / Transaction ID',
      sortable: true,
      render: (val) => <span className="font-mono text-slate-600 text-[11px]">{val || '—'}</span>,
    },
    {
      key: 'paymentDate',
      header: 'Payment Date',
      sortable: true,
      render: (val) => <span className="text-slate-600">{formatDate(val)}</span>,
    },
    {
      key: 'amount',
      header: 'Amount Paid',
      sortable: true,
      render: (val) => (
        <span className="font-extrabold text-emerald-600 font-heading">
          {formatCurrency(val)}
        </span>
      ),
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
        title="Payments"
        subtitle="Receipt register, direct payment reconciliations, and invoice settlement ledger."
      />

      <DataTable
        columns={columns}
        data={payments}
        loading={loading}
        searchPlaceholder="Search payments by reference, customer, or UTR..."
        exportFilename="payments_ledger"
        filterComponent={
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#64748B] font-medium hidden sm:inline">Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#E7EAF0] text-xs bg-white text-[#202744] outline-none"
            >
              <option value="ALL">All Methods</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
        }
      />
    </div>
  );
};

