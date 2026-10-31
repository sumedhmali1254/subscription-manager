import React, { useState, useEffect } from 'react';
import { planService } from '../../services/planService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { CheckCircle2, Users, Layers, Zap } from 'lucide-react';
import { toast } from 'sonner';

export const CustomerPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    planService.getAll().then(res => {
      setPlans(res.data.filter(p => p.activeStatus));
      setLoading(false);
    });
  }, []);

  const handleRequestUpgrade = (plan) => {
    toast.success(`Thank you! Your request to switch to "${plan.name}" has been logged. Our account team will contact your registered email.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Available Subscription Plans"
        subtitle="Explore Brightloop tiers, compute capacity, and enterprise support modules."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col justify-between hover:border-[#5263D9] transition-all">
            <div className="p-5">
              <span className="font-mono text-xs font-bold text-[#5263D9] uppercase">{plan.id}</span>
              <h3 className="text-lg font-bold text-[#202744] font-heading mt-1">{plan.name}</h3>
              <p className="text-xs text-[#64748B] mt-1 line-clamp-2 min-h-[32px]">{plan.description}</p>

              <div className="my-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold font-heading text-[#202744]">
                    {formatCurrency(plan.price)}
                  </span>
                  <span className="text-xs text-[#64748B]">/{plan.billingFrequency.toLowerCase()}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">
                  Included Entitlements
                </span>
                {(plan.includedProducts || []).map((prod, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{prod.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <CardFooter className="bg-slate-50/60">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => handleRequestUpgrade(plan)}
              >
                Request Plan Switch
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

