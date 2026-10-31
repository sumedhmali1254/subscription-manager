import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planService } from '../../services/planService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PlanFormModal } from './PlanFormModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  Edit2,
  Layers,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Repeat,
  Plus,
} from 'lucide-react';

export const PlanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const res = await planService.getById(id);
      setPlan(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-xs text-slate-400">Loading plan...</div>;
  if (!plan) return <div className="p-8 text-center">Plan not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/plans')}
          className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#5263D9] mb-3 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Plans
        </button>

        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF0FD] border border-indigo-100 flex items-center justify-center text-[#5263D9]">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-[#202744] font-heading">{plan.name}</h2>
                <Badge variant={plan.activeStatus ? 'success' : 'neutral'} dot>
                  {plan.activeStatus ? 'Active' : 'Archived'}
                </Badge>
              </div>
              <div className="text-xs text-[#64748B] mt-1 flex items-center gap-2">
                <span className="font-mono text-[#5263D9] font-bold">{plan.id}</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{plan.billingFrequency}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              icon={Edit2}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Plan
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate(`/subscriptions/new?planId=${plan.id}`)}
            >
              Subscribe Client
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 space-y-4">
          <CardHeader>
            <CardTitle>Pricing & Commercials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[#64748B] block font-medium">Recurring Price</span>
              <div className="text-3xl font-extrabold font-heading text-[#202744] mt-1">
                {formatCurrency(plan.price)}
                <span className="text-xs font-normal text-slate-500 ml-1">/{plan.billingFrequency.toLowerCase()}</span>
              </div>
              <div className="text-[11px] text-[#5263D9] font-semibold mt-2 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{plan.subscribersCount || 0} active subscriptions</span>
              </div>
            </div>

            <div>
              <span className="text-[#64748B] block font-medium">Description</span>
              <p className="text-slate-700 leading-relaxed mt-1">{plan.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Available From:</span>
                <span className="font-medium text-[#202744]">{formatDate(plan.availableFrom)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Available Until:</span>
                <span className="font-medium text-[#202744]">{formatDate(plan.availableUntil)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Min. Quantity:</span>
                <span className="font-bold text-[#202744]">{plan.minimumQuantity || 1}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 space-y-6">
          <CardHeader>
            <CardTitle>Entitlements & Included Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {(plan.includedProducts || []).map((prod, i) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="font-bold text-[#202744] block">{prod.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">ID: {prod.productId}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-white border border-slate-200 font-bold text-slate-700">
                    Qty: {prod.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#F8FAFC] rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-[#202744] uppercase tracking-wider mb-3 font-heading">
                Operational Policies
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Allow Pause:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                    {plan.allowPause ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                    {plan.allowPause ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Allow Renewal:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                    {plan.allowRenewal ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                    {plan.allowRenewal ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Early Closure:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                    {plan.allowEarlyClosure ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                    {plan.allowEarlyClosure ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Auto Close:</span>
                  <span className="font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                    {plan.autoCloseAtEnd ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PlanFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        plan={plan}
        onSubmit={async (data) => {
          await planService.update(plan.id, data);
          setIsEditModalOpen(false);
          fetchPlan();
        }}
      />
    </div>
  );
};

