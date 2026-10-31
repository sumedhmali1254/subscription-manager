import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { subscriptionService } from '../../services/subscriptionService';
import { invoiceService } from '../../services/invoiceService';
import { auditService } from '../../services/auditService';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AreaTrendChart } from '../../components/charts/AreaTrendChart';
import { LineGrowthChart } from '../../components/charts/LineGrowthChart';
import { DonutDistributionChart } from '../../components/charts/DonutDistributionChart';
import { BarMetricChart } from '../../components/charts/BarMetricChart';
import { ChartCard } from '../../components/charts/ChartCard';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Users,
  Repeat,
  TrendingUp,
  Receipt,
  CreditCard,
  AlertTriangle,
  Plus,
  FileText,
  UserPlus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [subGrowth, setSubGrowth] = useState([]);
  const [planDist, setPlanDist] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [recentSubs, setRecentSubs] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [
          metricsRes,
          trendsRes,
          growthRes,
          planDistRes,
          pmRes,
          subsRes,
          invRes,
          logsRes,
        ] = await Promise.all([
          reportService.getOverviewMetrics(dateRange),
          reportService.getRevenueTrends(),
          reportService.getSubscriptionGrowth(),
          reportService.getPlanDistribution(),
          reportService.getPaymentMethodsBreakdown(),
          subscriptionService.getAll(),
          invoiceService.getAll(),
          auditService.getAll(),
        ]);

        setMetrics(metricsRes.data);
        setRevenueTrends(trendsRes.data);
        setSubGrowth(growthRes.data);
        setPlanDist(planDistRes.data);
        setPaymentMethods(pmRes.data);
        setRecentSubs(subsRes.data.slice(0, 5));
        setRecentInvoices(invRes.data.slice(0, 5));
        setRecentLogs(logsRes.data.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange]);

  return (
    <div className="space-y-6">
      {/* Page Header with Top Actions & Date Filter */}
      <PageHeader
        title="Overview"
        subtitle="Monitor your subscriptions, recurring revenue and business performance."
      >
        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex items-center bg-white border border-[#E7EAF0] rounded-lg p-0.5 shadow-2xs">
            {[
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: '1y', label: '1Y' },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setDateRange(r.id)}
                className={`
                  px-2.5 py-1 text-xs font-semibold rounded-md transition-all
                  ${dateRange === r.id
                    ? 'bg-[#5263D9] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#202744] hover:bg-slate-100'
                  }
                `}
              >
                {r.label}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={UserPlus}
            onClick={() => navigate('/customers?action=create')}
          >
            Add Customer
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={FileText}
            onClick={() => navigate('/quotations/new')}
          >
            Quotation
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/subscriptions/new')}
          >
            Create Subscription
          </Button>
        </div>
      </PageHeader>

      {/* 6 Key Performance Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Customers"
          value={metrics?.totalCustomers ?? '—'}
          change="+14.8%"
          changeType="increase"
          period="vs last month"
          icon={Users}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          onClick={() => navigate('/customers')}
        />

        <StatCard
          title="Active Subscriptions"
          value={metrics?.activeSubscriptions ?? '—'}
          change="+18.2%"
          changeType="increase"
          period="vs last month"
          icon={Repeat}
          iconColor="text-[#5263D9]"
          iconBg="bg-[#EEF0FD]"
          onClick={() => navigate('/subscriptions?status=ACTIVE')}
        />

        <StatCard
          title="Monthly Recurring (MRR)"
          value={formatCurrency(metrics?.mrr || 0)}
          change="+22.4%"
          changeType="increase"
          period="vs last month"
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          onClick={() => navigate('/reports')}
        />

        <StatCard
          title="Total Invoiced"
          value={formatCurrency(metrics?.totalInvoiced || 0)}
          period="Total Invoiced Volume"
          icon={Receipt}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          onClick={() => navigate('/invoices')}
        />

        <StatCard
          title="Collected Payments"
          value={formatCurrency(metrics?.totalCollected || 0)}
          period="Net settled in bank"
          icon={CreditCard}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
          onClick={() => navigate('/payments')}
        />

        <StatCard
          title="Overdue Invoices"
          value={metrics?.overdueCount ?? 0}
          change={formatCurrency(metrics?.overdueAmount || 0)}
          changeType="decrease"
          period="Needs collections"
          icon={AlertTriangle}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
          onClick={() => navigate('/invoices?status=OVERDUE')}
        />
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Monthly Revenue Trend"
          subtitle="Invoiced billings vs collected cash settlements"
          className="lg:col-span-2"
          action={
            <span className="text-[11px] text-[#64748B] font-mono">
              ARR: {formatCurrency((metrics?.mrr || 0) * 12)}
            </span>
          }
        >
          <AreaTrendChart data={revenueTrends} height={290} />
        </ChartCard>

        <ChartCard
          title="Revenue By Plan"
          subtitle="Distribution of recurring MRR by tier"
        >
          <DonutDistributionChart data={planDist} height={290} />
        </ChartCard>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Subscription Growth & Cohorts"
          subtitle="Active subscriptions over time and new signups"
        >
          <LineGrowthChart data={subGrowth} height={270} />
        </ChartCard>

        <ChartCard
          title="Payment Collection Methods"
          subtitle="Settlement channels by volume (INR)"
        >
          <BarMetricChart data={paymentMethods} height={270} />
        </ChartCard>
      </div>

      {/* Bottom Data Tables Row: Recent Subscriptions & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Subscriptions */}
        <Card>
          <CardHeader
            action={
              <button
                type="button"
                onClick={() => navigate('/subscriptions')}
                className="text-xs text-[#5263D9] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <CardTitle>Recent Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E7EAF0] text-[#64748B] text-[11px] uppercase">
                    <th className="py-2.5 px-4 font-semibold">Subscription</th>
                    <th className="py-2.5 px-4 font-semibold">Customer</th>
                    <th className="py-2.5 px-4 font-semibold">Plan</th>
                    <th className="py-2.5 px-4 font-semibold">Amount</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSubs.map((sub) => (
                    <tr
                      key={sub.id}
                      onClick={() => navigate(`/subscriptions/${sub.id}`)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-[#5263D9] font-mono">
                        {sub.subscriptionNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#202744]">{sub.customerName}</div>
                        <div className="text-[11px] text-[#64748B]">{sub.customerCompany}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{sub.planName}</td>
                      <td className="py-3 px-4 font-semibold text-[#202744]">
                        {formatCurrency(sub.amount)}
                        <span className="text-[10px] text-slate-400 font-normal ml-0.5">/{sub.billingFrequency.toLowerCase().slice(0, 2)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={sub.status} type="subscription" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader
            action={
              <button
                type="button"
                onClick={() => navigate('/invoices')}
                className="text-xs text-[#5263D9] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E7EAF0] text-[#64748B] text-[11px] uppercase">
                    <th className="py-2.5 px-4 font-semibold">Invoice</th>
                    <th className="py-2.5 px-4 font-semibold">Customer</th>
                    <th className="py-2.5 px-4 font-semibold">Due Date</th>
                    <th className="py-2.5 px-4 font-semibold">Balance</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-[#202744] font-mono">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#202744]">{inv.customerName}</div>
                        <div className="text-[11px] text-[#64748B]">{inv.customerCompany}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#202744]">
                        {formatCurrency(inv.outstandingBalance)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={inv.status} type="invoice" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Renewals & Live Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Renewals */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Renewals (Next 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {[
              {
                customer: 'Acme Technologies',
                plan: 'Enterprise Scale',
                date: '15 Nov 2026',
                amount: 10618.82,
                autoRenew: true,
              },
              {
                customer: 'CloudPulse Systems',
                plan: 'Professional Business',
                date: '01 Nov 2026',
                amount: 4318.92,
                autoRenew: true,
              },
              {
                customer: 'TechSprint Solutions',
                plan: 'Professional Business',
                date: '10 Nov 2026',
                amount: 4718.82,
                autoRenew: false,
              },
            ].map((ren, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-[#202744]">{ren.customer}</h5>
                  <p className="text-[11px] text-[#64748B]">{ren.plan} • {ren.date}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[#5263D9]">{formatCurrency(ren.amount)}</div>
                  <span className={`text-[10px] font-semibold ${ren.autoRenew ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {ren.autoRenew ? 'Auto-renews' : 'Manual invoice'}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Live System Activity Stream */}
        <Card className="lg:col-span-2">
          <CardHeader
            action={
              <button
                type="button"
                onClick={() => navigate('/audit-logs')}
                className="text-xs text-[#5263D9] hover:underline font-semibold cursor-pointer"
              >
                View all logs
              </button>
            }
          >
            <CardTitle>Recent Activity & Audit Timeline</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-xs">
                  <div className="w-7 h-7 rounded-full bg-[#EEF0FD] text-[#5263D9] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                    {log.userName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#202744] truncate">{log.userName}</span>
                      <span className="text-[11px] text-slate-400 shrink-0 font-mono">
                        {formatDate(log.timestamp, 'dd MMM, hh:mm a')}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{log.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

