import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quotationService } from '../../services/quotationService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Eye, Send, CheckCircle2, Repeat, Building } from 'lucide-react';

export const QuotationListPage = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await quotationService.getAll({ status: statusFilter });
      setQuotations(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [statusFilter]);

  const columns = [
    {
      key: 'quotationNumber',
      header: 'Quotation #',
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
      key: 'planName',
      header: 'Plan Tier',
      sortable: true,
      render: (val) => <span className="text-slate-700 font-medium">{val}</span>,
    },
    {
      key: 'quotationDate',
      header: 'Date',
      sortable: true,
      render: (val) => <span className="text-slate-600">{formatDate(val)}</span>,
    },
    {
      key: 'expiryDate',
      header: 'Valid Until',
      sortable: true,
      render: (val) => <span className="text-slate-600">{formatDate(val)}</span>,
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      sortable: true,
      render: (val) => <span className="font-bold text-[#202744]">{formatCurrency(val)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} type="quotation" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => navigate(`/quotations/${row.id}`)}
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
        title="Quotations"
        subtitle="Commercial subscription proposals, template agreements, and conversion pipeline."
      >
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate('/quotations/new')}
        >
          Create Quotation
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={quotations}
        loading={loading}
        searchPlaceholder="Search quotations by number or customer..."
        exportFilename="quotations_list"
        onRowClick={(row) => navigate(`/quotations/${row.id}`)}
        filterComponent={
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#64748B] font-medium hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#E7EAF0] text-xs bg-white text-[#202744] outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CONVERTED">Converted</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        }
      />
    </div>
  );
};

