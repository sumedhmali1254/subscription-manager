import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { quotationService } from '../../services/quotationService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Eye, CheckCircle2 } from 'lucide-react';

export const CustomerQuotationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const customerId = user?.customerId || 'CUST-001';

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await quotationService.getAll();
      setQuotations(res.data.filter(q => q.customerId === customerId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [customerId]);

  const handleConfirmQuote = async (id) => {
    try {
      await quotationService.confirmQuotation(id);
      fetchQuotes();
      alert('Quotation confirmed! Brightloop operations team has been notified.');
    } catch (e) {
      alert('Action failed');
    }
  };

  const columns = [
    {
      key: 'quotationNumber',
      header: 'Proposal #',
      sortable: true,
      render: (val) => <span className="font-mono font-bold text-[#5263D9]">{val}</span>,
    },
    {
      key: 'planName',
      header: 'Plan Tier',
      sortable: true,
      render: (val) => <span className="font-semibold text-[#202744]">{val}</span>,
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
      header: 'Proposed Total',
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
        <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          {row.status === 'SENT' && (
            <button
              type="button"
              onClick={() => handleConfirmQuote(row.id)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              Accept Proposal
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate(`/quotations/${row.id}`)}
            className="p-1.5 text-slate-400 hover:text-[#5263D9] hover:bg-slate-100 rounded-lg"
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
        title="My Quotations & Proposals"
        subtitle="Review customized commercial agreements and confirm subscription renewals."
      />

      <DataTable
        columns={columns}
        data={quotations}
        loading={loading}
        searchPlaceholder="Search proposals..."
        exportFilename="my_proposals"
      />
    </div>
  );
};

