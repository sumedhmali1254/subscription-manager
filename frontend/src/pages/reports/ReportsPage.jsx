import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { ChartCard } from '../../components/charts/ChartCard';
import { AreaTrendChart } from '../../components/charts/AreaTrendChart';
import { LineGrowthChart } from '../../components/charts/LineGrowthChart';
import { DonutDistributionChart } from '../../components/charts/DonutDistributionChart';
import { BarMetricChart } from '../../components/charts/BarMetricChart';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';
import { exportToCsv } from '../../utils/exportCsv';
import {
  TrendingUp,
  Receipt,
  CreditCard,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';

export const ReportsPage = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [metrics, setMetrics] = useState(null);
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [subGrowth, setSubGrowth] = useState([]);
  const [planDist, setPlanDist] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const [mRes, rRes, gRes, pRes, pmRes] = await Promise.all([
          reportService.getOverviewMetrics(dateRange),
          reportService.getRevenueTrends(),
          reportService.getSubscriptionGrowth(),
          reportService.getPlanDistribution(),
          reportService.getPaymentMethodsBreakdown(),
        ]);
        setMetrics(mRes.data);
        setRevenueTrends(rRes.data);
        setSubGrowth(gRes.data);
        setPlanDist(pRes.data);
        setPaymentMethods(pmRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [dateRange]);

  const handleExportFinancials = () => {
    exportToCsv('brightloop_revenue_trends', revenueTrends, [
      { key: 'month', label: 'Billing Period' },
      { key: 'invoiced', label: 'Invoiced Billings (INR)' },
      { key: 'collected', label: 'Collected Settlements (INR)' },
      { key: 'mrr', label: 'MRR (INR)' },
    ]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Financial intelligence, recurring cash flow metrics, and receivables ledger."
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-[#E7EAF0] rounded-lg p-0.5 shadow-2xs">
            {['30d', '90d', '1y'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDateRange(r)}
                className={`
                  px-2.5 py-1 text-xs font-semibold rounded-md transition-all
                  ${dateRange === r
                    ? 'bg-[#5263D9] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#202744] hover:bg-slate-100'
                  }
                `}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleExportFinancials}
          >
            Export Financial Report
          </Button>
        </div>
      </PageHeader>

      {/* 4 Core Financial Distinction Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Recurring (MRR)"
          value={formatCurrency(metrics?.mrr || 0)}
          change="+22.4%"
          changeType="increase"
          period={`ARR: ${formatCurrency((metrics?.mrr || 0) * 12)}`}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        <StatCard
          title="Total Invoiced"
          value={formatCurrency(metrics?.totalInvoiced || 0)}
          period="Total Invoiced Revenue"
          icon={Receipt}
          iconColor="text-[#5263D9]"
          iconBg="bg-[#EEF0FD]"
        />

        <StatCard
          title="Collected Cash"
          value={formatCurrency(metrics?.totalCollected || 0)}
          period="Net settled in bank account"
          icon={CreditCard}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />

        <StatCard
          title="Outstanding Receivables"
          value={formatCurrency(metrics?.outstandingReceivables || 0)}
          period={`${metrics?.overdueCount || 0} overdue invoices`}
          changeType={metrics?.outstandingReceivables > 0 ? 'decrease' : 'increase'}
          icon={AlertTriangle}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
        />
      </div>

      {/* Chart 1: Invoiced vs Collected */}
      <ChartCard
        title="Revenue Reconciliation: Invoiced Billings vs Collected Cash"
        subtitle="Comparing booked recurring invoices with realized bank settlements"
        action={
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            Collection Efficiency: 92.4%
          </span>
        }
      >
        <AreaTrendChart data={revenueTrends} height={320} />
      </ChartCard>

      {/* Chart 2 & 3: Plan Distribution & Subscription Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Revenue Share by Subscription Tier"
          subtitle="Monthly Recurring Revenue breakdown by plan"
        >
          <DonutDistributionChart data={planDist} height={300} />
        </ChartCard>

        <ChartCard
          title="Subscriber Growth Cohort"
          subtitle="Net active customer recurring subscriptions over time"
        >
          <LineGrowthChart data={subGrowth} height={300} />
        </ChartCard>
      </div>

      {/* Financial Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Monthly Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E7EAF0] text-[#64748B] text-[11px] uppercase">
                  <th className="py-3 px-4 font-semibold">Period</th>
                  <th className="py-3 px-4 font-semibold text-right">Invoiced Revenue</th>
                  <th className="py-3 px-4 font-semibold text-right">Collected Settlements</th>
                  <th className="py-3 px-4 font-semibold text-right">Monthly Recurring (MRR)</th>
                  <th className="py-3 px-4 font-semibold text-center">Collection Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {revenueTrends.map((row, i) => {
                  const rate = ((row.collected / row.invoiced) * 100).toFixed(1);
                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-[#202744]">{row.month}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-800">{formatCurrency(row.invoiced)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">{formatCurrency(row.collected)}</td>
                      <td className="py-3 px-4 text-right font-mono text-[#5263D9]">{formatCurrency(row.mrr)}</td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

