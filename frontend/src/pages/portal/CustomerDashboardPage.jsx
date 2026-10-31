import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customerService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Repeat,
  Receipt,
  CreditCard,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const customerId = user?.customerId || 'CUST-001';

  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortalData = async () => {
      setLoading(true);
      try {
        const [subsRes, invsRes, paysRes] = await Promise.all([
          customerService.getCustomerSubscriptions(customerId),
          customerService.getCustomerInvoices(customerId),
          customerService.getCustomerPayments(customerId),
        ]);
        setSubscriptions(subsRes.data);
        setInvoices(invsRes.data);
        setPayments(paysRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchPortalData();
  }, [customerId]);

  const activeSub = subscriptions.find(s => s.status === 'ACTIVE') || subscriptions[0];
  const pendingInvoices = invoices.filter(i => i.outstandingBalance > 0);
  const totalBalanceDue = pendingInvoices.reduce((acc, i) => acc + Number(i.outstandingBalance || 0), 0);
  const totalPaid = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#252D55] to-[#3B487A] rounded-2xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A5B4FC] block mb-1">
            Customer Self-Service Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading">
            Welcome back, {user?.name || 'Customer'}
          </h2>
          <p className="text-xs sm:text-sm text-[#D0D6EC] mt-1.5 leading-relaxed">
            Manage your Brightloop Software subscriptions, review recurring invoices, and download settlement receipts.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Button
              variant="teal"
              size="sm"
              icon={Layers}
              onClick={() => navigate('/portal/plans')}
            >
              Browse Available Plans
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Receipt}
              onClick={() => navigate('/portal/invoices')}
            >
              View Invoices ({invoices.length})
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Subscription"
          value={activeSub ? activeSub.planName : 'No active plan'}
          period={activeSub ? `${formatCurrency(activeSub.amount)} / ${activeSub.billingFrequency.toLowerCase()}` : 'Subscribe now'}
          icon={Repeat}
          iconColor="text-[#5263D9]"
          iconBg="bg-[#EEF0FD]"
          onClick={() => navigate('/portal/subscriptions')}
        />

        <StatCard
          title="Next Renewal Date"
          value={activeSub?.nextBillingDate ? formatDate(activeSub.nextBillingDate) : '—'}
          period="Auto-renews monthly"
          icon={Calendar}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />

        <StatCard
          title="Outstanding Balance Due"
          value={formatCurrency(totalBalanceDue)}
          period={totalBalanceDue > 0 ? `${pendingInvoices.length} invoice pending` : 'All invoices settled'}
          changeType={totalBalanceDue > 0 ? 'decrease' : 'increase'}
          icon={AlertTriangle}
          iconColor={totalBalanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}
          iconBg={totalBalanceDue > 0 ? 'bg-rose-50' : 'bg-emerald-50'}
          onClick={() => navigate('/portal/invoices')}
        />

        <StatCard
          title="Total Lifetime Paid"
          value={formatCurrency(totalPaid)}
          period={`${payments.length} verified settlements`}
          icon={CreditCard}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
          onClick={() => navigate('/portal/payments')}
        />
      </div>

      {/* Current Active Plan Overview */}
      {activeSub && (
        <Card className="border-[#5263D9]/20 shadow-sm">
          <CardHeader
            action={
              <Button
                variant="secondary"
                size="xs"
                onClick={() => navigate('/portal/subscriptions')}
              >
                Manage Subscription
              </Button>
            }
          >
            <CardTitle>Current Active Plan: {activeSub.planName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-[#64748B] block">Subscription ID</span>
                <span className="font-mono font-bold text-[#5263D9]">{activeSub.subscriptionNumber}</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Recurring Rate</span>
                <span className="font-bold text-[#202744] text-sm">
                  {formatCurrency(activeSub.totalAmount)} / {activeSub.billingFrequency.toLowerCase()}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block">Next Billing Cycle</span>
                <span className="font-semibold text-slate-800">{formatDate(activeSub.nextBillingDate)}</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-[#202744] block mb-2 uppercase text-[10px] tracking-wider">
                Plan Entitlements Included:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(activeSub.lines || []).map((l, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{l.productName}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Invoices & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <Card>
          <CardHeader
            action={
              <button
                type="button"
                onClick={() => navigate('/portal/invoices')}
                className="text-xs text-[#5263D9] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <CardTitle>My Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#64748B]">No invoices found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E7EAF0] text-[#64748B] text-[11px] uppercase">
                      <th className="py-2.5 px-4 font-semibold">Invoice #</th>
                      <th className="py-2.5 px-4 font-semibold">Due Date</th>
                      <th className="py-2.5 px-4 font-semibold">Amount</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.slice(0, 5).map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-[#5263D9]">{inv.invoiceNumber}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(inv.dueDate)}</td>
                        <td className="py-3 px-4 font-bold text-[#202744]">{formatCurrency(inv.totalAmount)}</td>
                        <td className="py-3 px-4"><StatusBadge status={inv.status} type="invoice" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader
            action={
              <button
                type="button"
                onClick={() => navigate('/portal/payments')}
                className="text-xs text-[#5263D9] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <CardTitle>Settled Payment Receipts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#64748B]">No payments recorded yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E7EAF0] text-[#64748B] text-[11px] uppercase">
                      <th className="py-2.5 px-4 font-semibold">Receipt #</th>
                      <th className="py-2.5 px-4 font-semibold">Date</th>
                      <th className="py-2.5 px-4 font-semibold">Method</th>
                      <th className="py-2.5 px-4 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.slice(0, 5).map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-[#202744]">{pay.paymentReference}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(pay.paymentDate)}</td>
                        <td className="py-3 px-4 text-slate-700">{pay.paymentMethod}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">{formatCurrency(pay.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

