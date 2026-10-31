import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscriptionService } from '../../services/subscriptionService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Eye, Repeat, Building, Calendar, DollarSign } from 'lucide-react';

export const SubscriptionListPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await subscriptionService.getAll({
        status: statusFilter,
      });
      setSubscriptions(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const columns = [
    {
      key: 'subscriptionNumber',
      header: 'Subscription #',
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
      header: 'Plan',
      sortable: true,
      render: (val, row) => (
        <span className="font-medium text-slate-700">
          {val}
          <span className="text-[10px] text-slate-400 block font-normal capitalize">
            {row.billingFrequency?.toLowerCase()} cycle
          </span>
        </span>
      ),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      sortable: true,
      render: (val) => <span className="text-slate-600">{formatDate(val)}</span>,
    },
    {
      key: 'nextBillingDate',
      header: 'Next Billing',
      sortable: true,
      render: (val) => (
        <span className="text-slate-700 font-medium">
          {val ? formatDate(val) : '—'}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Recurring Amount',
      sortable: true,
      render: (val, row) => (
        <span className="font-bold text-[#202744]">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} type="subscription" />,
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => navigate(`/subscriptions/${row.id}`)}
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
        title="Subscriptions"
        subtitle="Active recurring client subscriptions, contract lifecycles, and renewal billing."
      >
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate('/subscriptions/new')}
        >
          Create Subscription
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={subscriptions}
        loading={loading}
        searchPlaceholder="Search subscriptions by number, client, or plan..."
        exportFilename="subscriptions_list"
        onRowClick={(row) => navigate(`/subscriptions/${row.id}`)}
        filterComponent={
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#64748B] font-medium hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#E7EAF0] text-xs bg-white text-[#202744] outline-none"
            >
              <option value="ALL">All Lifecycles</option>
              <option value="ACTIVE">Active</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PAUSED">Paused</option>
              <option value="DRAFT">Draft</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        }
      />
    </div>
  );
};

