import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customerService';
import { invoiceService } from '../../services/invoiceService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RecordPaymentModal } from '../invoices/RecordPaymentModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Receipt, CreditCard, Printer } from 'lucide-react';

export const CustomerInvoicesPage = () => {
  const { user } = useAuth();
  const customerId = user?.customerId || 'CUST-001';

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payInvoice, setPayInvoice] = useState(null);
  const [payLoading, setPayLoading] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await customerService.getCustomerInvoices(customerId);
      setInvoices(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [customerId]);

  const handlePay = async (paymentData) => {
    if (!payInvoice) return;
    setPayLoading(true);
    try {
      await invoiceService.recordPayment(payInvoice.id, paymentData);
      setPayInvoice(null);
      fetchInvoices();
      alert('Payment settlement recorded successfully!');
    } finally {
      setPayLoading(false);
    }
  };

  const columns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      sortable: true,
      render: (val) => <span className="font-mono font-bold text-[#5263D9]">{val}</span>,
    },
    {
      key: 'invoiceDate',
      header: 'Date Issued',
      sortable: true,
      render: (val) => <span className="text-slate-600">{formatDate(val)}</span>,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (val, row) => (
        <span className={row.status === 'OVERDUE' ? 'text-rose-600 font-bold' : 'text-slate-600'}>
          {formatDate(val)}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      sortable: true,
      render: (val) => <span className="font-bold text-[#202744]">{formatCurrency(val)}</span>,
    },
    {
      key: 'outstandingBalance',
      header: 'Outstanding Balance',
      sortable: true,
      render: (val) => (
        <span className={`font-bold ${val > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} type="invoice" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
          {row.outstandingBalance > 0 && row.status !== 'CANCELLED' && (
            <button
              type="button"
              onClick={() => setPayInvoice(row)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#5263D9] text-white hover:bg-[#414FC0] transition-colors cursor-pointer"
            >
              Pay Now
            </button>
          )}
          <button
            type="button"
            onClick={() => window.open(`/invoices/${row.id}`, '_blank')}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            title="Download PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Invoices"
        subtitle="Review billed recurring cycles, settle outstanding balances, and download tax invoices."
      />

      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        searchPlaceholder="Search invoices..."
        exportFilename="my_invoices"
      />

      {/* Payment Settlement Modal */}
      <RecordPaymentModal
        isOpen={!!payInvoice}
        onClose={() => setPayInvoice(null)}
        invoice={payInvoice}
        onSubmit={handlePay}
        loading={payLoading}
      />
    </div>
  );
};

