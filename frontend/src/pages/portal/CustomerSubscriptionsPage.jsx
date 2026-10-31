import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customerService';
import { subscriptionService } from '../../services/subscriptionService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Repeat, Calendar, CheckCircle2, Pause, Play, Layers } from 'lucide-react';

export const CustomerSubscriptionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const customerId = user?.customerId || 'CUST-001';

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const res = await customerService.getCustomerSubscriptions(customerId);
      setSubscriptions(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, [customerId]);

  const handleTogglePause = async (sub) => {
    const nextStatus = sub.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await subscriptionService.transitionStatus(sub.id, nextStatus);
      fetchSubs();
      alert(`Subscription status updated to ${nextStatus}`);
    } catch (e) {
      alert('Action could not be completed.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Subscriptions"
        subtitle="Active software licenses, included modules, and renewal schedules."
      >
        <Button
          variant="primary"
          icon={Layers}
          onClick={() => navigate('/portal/plans')}
        >
          Browse More Plans
        </Button>
      </PageHeader>

      <div className="space-y-4">
        {subscriptions.map((sub) => (
          <Card key={sub.id} className="overflow-hidden">
            <CardHeader className="bg-slate-50/70">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-[#5263D9]">{sub.subscriptionNumber}</span>
                  <StatusBadge status={sub.status} type="subscription" />
                </div>
                <div className="flex items-center gap-2">
                  {sub.status === 'ACTIVE' && (
                    <Button
                      variant="secondary"
                      size="xs"
                      icon={Pause}
                      onClick={() => handleTogglePause(sub)}
                    >
                      Request Pause
                    </Button>
                  )}
                  {sub.status === 'PAUSED' && (
                    <Button
                      variant="primary"
                      size="xs"
                      icon={Play}
                      onClick={() => handleTogglePause(sub)}
                    >
                      Resume
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#202744] font-heading">{sub.planName}</h3>
                  <div className="flex items-center gap-3 text-slate-600 mt-1">
                    <span>Started: {formatDate(sub.startDate)}</span>
                    <span>•</span>
                    <span>Next Renewal: <strong className="text-slate-800">{formatDate(sub.nextBillingDate)}</strong></span>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <span className="text-xs text-[#64748B] block">Recurring Amount</span>
                  <span className="text-2xl font-bold font-heading text-[#5263D9]">
                    {formatCurrency(sub.totalAmount)}
                    <span className="text-xs font-normal text-slate-500 ml-1">/{sub.billingFrequency.toLowerCase()}</span>
                  </span>
                </div>
              </div>

              {/* Lines & Addons */}
              <div className="pt-3 border-t border-slate-100">
                <span className="font-semibold text-slate-700 block mb-2 uppercase text-[10px] tracking-wider">
                  Active Software Components:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(sub.lines || []).map((l, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{l.productName}</span>
                    </div>
                  ))}
                  {(sub.addOns || []).map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-indigo-50/60 rounded-lg text-slate-700 border border-indigo-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#5263D9] shrink-0" />
                        <span className="font-medium text-[#5263D9]">{a.name} (Add-on)</span>
                      </div>
                      <span className="font-bold text-[#5263D9]">{formatCurrency(a.price)}/mo</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

