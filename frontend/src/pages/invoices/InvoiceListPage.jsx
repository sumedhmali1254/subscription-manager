import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { invoiceService } from '../../services/invoiceService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RecordPaymentModal } from './RecordPaymentModal';
import { InvoiceCreateModal } from './InvoiceCreateModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Eye, CreditCard, Receipt, Building, Calendar } from 'lucide-react';

export const InvoiceListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');

  // Modals
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await invoiceService.getAll({
        status: statusFilter,
      });
      setInvoices(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  // Open create invoice if ?action=create is present
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsCreateModalOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  const handleRecordPayment = async (paymentData) => {
    if (!paymentInvoice) return;
    setPaymentLoading(true);
    try {
      await invoiceService.recordPayment(paymentInvoice.id, paymentData);
      setPaymentInvoice(null);
      fetchInvoices();
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleCreateInvoice = async (invoiceData) => {
    setCreateLoading(true);
    try {
      await invoiceService.create(invoiceData);
      setIsCreateModalOpen(false);
      fetchInvoices();
    } finally {
      setCreateLoading(false);
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
      key: 'subscriptionNumber',
      header: 'Subscription',
      sortable: true,
      render: (val) => val ? (
        <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
          {val}
        </span>
      ) : <span className="text-slate-400">One-off</span>,
    },
    {
      key: 'invoiceDate',
      header: 'Invoice Date',
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
      header: 'Total',
      sortable: true,
      render: (val) => <span className="font-bold text-[#202744]">{formatCurrency(val)}</span>,
    },
    {
      key: 'outstandingBalance',
      header: 'Balance Due',
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
        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
          {row.outstandingBalance > 0 && row.status !== 'CANCELLED' && (
            <button
              type="button"
              onClick={() => setPaymentInvoice(row)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Record payment"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate(`/invoices/${row.id}`)}
            className="p-1.5 text-slate-400 hover:text-[#5263D9] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        subtitle="Recurring subscription invoices, payment allocations, and receivables management."
      >
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Invoice
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        searchPlaceholder="Search invoices by number or customer..."
        exportFilename="invoices_register"
        onRowClick={(row) => navigate(`/invoices/${row.id}`)}
        filterComponent={
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#64748B] font-medium hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#E7EAF0] text-xs bg-white text-[#202744] outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="DRAFT">Draft</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        }
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={!!paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        invoice={paymentInvoice}
        onSubmit={handleRecordPayment}
        loading={paymentLoading}
      />

      {/* Create Direct Invoice Modal */}
      <InvoiceCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateInvoice}
        loading={createLoading}
      />
    </div>
  );
};

