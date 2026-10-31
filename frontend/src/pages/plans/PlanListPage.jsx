import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { planService } from '../../services/planService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/tables/DataTable';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { PlanFormModal } from './PlanFormModal';
import { formatCurrency } from '../../utils/formatters';
import {
  Layers,
  Plus,
  LayoutGrid,
  List,
  CheckCircle2,
  Users,
  Edit2,
  Trash2,
  Eye,
  Calendar,
} from 'lucide-react';

export const PlanListPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [frequencyFilter, setFrequencyFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await planService.getAll({ frequency: frequencyFilter });
      setPlans(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [frequencyFilter]);

  const handleSavePlan = async (data) => {
    setFormLoading(true);
    try {
      if (selectedPlan) {
        await planService.update(selectedPlan.id, data);
      } else {
        await planService.create(data);
      }
      setIsModalOpen(false);
      fetchPlans();
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await planService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchPlans();
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'Plan ID',
      sortable: true,
      render: (val) => <span className="font-mono font-bold text-[#5263D9]">{val}</span>,
    },
    {
      key: 'name',
      header: 'Plan Name',
      sortable: true,
      render: (_, row) => (
        <div>
          <div className="font-semibold text-[#202744] hover:text-[#5263D9]">{row.name}</div>
          <div className="text-[11px] text-[#64748B] line-clamp-1">{row.description}</div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      render: (val, row) => (
        <span className="font-bold text-[#202744]">
          {formatCurrency(val)}
          <span className="text-[11px] text-slate-400 font-normal ml-0.5">/{row.billingFrequency.toLowerCase().slice(0, 2)}</span>
        </span>
      ),
    },
    {
      key: 'billingFrequency',
      header: 'Frequency',
      sortable: true,
      render: (val) => (
        <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 text-slate-700">
          {val}
        </span>
      ),
    },
    {
      key: 'subscribersCount',
      header: 'Subscribers',
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#5263D9]" />
          <span className="font-semibold text-[#202744]">{val || 0}</span>
        </div>
      ),
    },
    {
      key: 'activeStatus',
      header: 'Status',
      sortable: true,
      render: (val) => (
        <Badge variant={val ? 'success' : 'neutral'} dot>
          {val ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => navigate(`/plans/${row.id}`)}
            className="p-1.5 text-slate-400 hover:text-[#5263D9] hover:bg-slate-100 rounded-lg cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedPlan(row);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            title="Edit Plan"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
            title="Delete Plan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Plans"
        subtitle="Manage recurring billing tiers, packaging rules, and contract terms."
      >
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-[#E7EAF0] rounded-lg p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-[#5263D9] text-white' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-[#5263D9] text-white' : 'text-slate-400 hover:text-slate-600'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setSelectedPlan(null);
              setIsModalOpen(true);
            }}
          >
            Create Plan
          </Button>
        </div>
      </PageHeader>

      {/* Grid Cards View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="flex flex-col justify-between hover:border-[#5263D9]/40 hover:shadow-card-hover transition-all"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-[#5263D9]">{plan.id}</span>
                  <Badge variant={plan.activeStatus ? 'success' : 'neutral'} dot size="xs">
                    {plan.activeStatus ? 'Active' : 'Archived'}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-[#202744] font-heading">{plan.name}</h3>
                <p className="text-xs text-[#64748B] mt-1.5 line-clamp-2 min-h-[32px]">
                  {plan.description}
                </p>

                <div className="my-5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold font-heading text-[#202744]">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-xs text-[#64748B] font-medium">
                      /{plan.billingFrequency.toLowerCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#5263D9]" />
                    <span>{plan.subscribersCount || 0} active subscribers</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
                    Included Components
                  </span>
                  {(plan.includedProducts || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                  ))}
                  {(!plan.includedProducts || plan.includedProducts.length === 0) && (
                    <div className="text-[11px] text-slate-400">Standard cloud license</div>
                  )}
                </div>
              </div>

              <CardFooter className="bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => navigate(`/plans/${plan.id}`)}
                  className="text-xs font-semibold text-[#5263D9] hover:underline"
                >
                  View Details
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(plan)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={plans}
          loading={loading}
          searchPlaceholder="Search plans..."
          exportFilename="subscription_plans"
          onRowClick={(row) => navigate(`/plans/${row.id}`)}
        />
      )}

      {/* Plan Form Modal */}
      <PlanFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSavePlan}
        plan={selectedPlan}
        loading={formLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Archive Subscription Plan"
        message={`Are you sure you want to archive "${deleteTarget?.name}"? Existing subscribers will continue on their term until renewal.`}
        confirmLabel="Archive Plan"
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

