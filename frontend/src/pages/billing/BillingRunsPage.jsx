import React, { useState, useEffect } from 'react';
import { billingService } from '../../services/billingService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { BillingRunDetailModal } from './BillingRunDetailModal';
import { formatDateTime } from '../../utils/formatters';
import { PlayCircle, Eye, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export const BillingRunsPage = () => {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningBatch, setRunningBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  const [selectedRun, setSelectedRun] = useState(null);
  const [retryLoading, setRetryLoading] = useState(false);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await billingService.getRuns();
      setRuns(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleStartBillingRun = async () => {
    setRunningBatch(true);
    setBatchProgress(10);

    const interval = setInterval(() => {
      setBatchProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 400);

    try {
      const res = await billingService.startBillingRun();
      clearInterval(interval);
      setBatchProgress(100);
      setTimeout(() => {
        setRunningBatch(false);
        setBatchProgress(0);
        fetchRuns();
        toast.success(res.message);
      }, 500);
    } catch (e) {
      clearInterval(interval);
      setRunningBatch(false);
      toast.error('Billing run failed');
    }
  };

  const handleRetryFailed = async (runId) => {
    setRetryLoading(true);
    try {
      const res = await billingService.retryFailed(runId);
      setSelectedRun(res.data);
      fetchRuns();
      toast.success(res.message);
    } finally {
      setRetryLoading(false);
    }
  };

  const columns = [
    {
      key: 'runNumber',
      header: 'Run ID',
      sortable: true,
      render: (val, row) => <span className="font-mono font-bold text-[#5263D9]">{val || row.id}</span>,
    },
    {
      key: 'startedAt',
      header: 'Started At',
      sortable: true,
      render: (val) => <span className="text-slate-600">{formatDateTime(val)}</span>,
    },
    {
      key: 'completedAt',
      header: 'Completed At',
      sortable: true,
      render: (val) => <span className="text-slate-600">{formatDateTime(val)}</span>,
    },
    {
      key: 'processedCount',
      header: 'Processed',
      sortable: true,
      render: (val) => <span className="font-bold text-[#202744]">{val}</span>,
    },
    {
      key: 'successCount',
      header: 'Success',
      sortable: true,
      render: (val) => <span className="font-bold text-emerald-600">{val}</span>,
    },
    {
      key: 'failureCount',
      header: 'Failed',
      sortable: true,
      render: (val) => (
        <span className={`font-bold ${val > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
          {val}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (val, row) => (
        <Badge variant={row.failureCount === 0 ? 'success' : 'warning'} dot>
          {val}
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
            onClick={() => setSelectedRun(row)}
            className="p-1.5 text-slate-400 hover:text-[#5263D9] hover:bg-slate-100 rounded-lg cursor-pointer"
            title="View Run Details"
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
        title="Billing Runs"
        subtitle="Automated batch recurring invoice generator, dunning jobs, and renewal executions."
      >
        <Button
          variant="primary"
          icon={PlayCircle}
          loading={runningBatch}
          onClick={handleStartBillingRun}
        >
          {runningBatch ? `Processing Cycle (${batchProgress}%)...` : 'Start Billing Run'}
        </Button>
      </PageHeader>

      {/* Progress banner when running */}
      {runningBatch && (
        <div className="p-4 bg-white rounded-xl border border-[#5263D9]/30 shadow-card space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#202744]">
              Executing automated renewal cycle for active PostgreSQL subscriptions...
            </span>
            <span className="font-mono text-[#5263D9] font-bold">{batchProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5263D9] transition-all duration-300"
              style={{ width: `${batchProgress}%` }}
            />
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={runs}
        loading={loading}
        searchPlaceholder="Search runs by ID..."
        exportFilename="billing_runs"
        onRowClick={(row) => setSelectedRun(row)}
      />

      <BillingRunDetailModal
        isOpen={!!selectedRun}
        onClose={() => setSelectedRun(null)}
        run={selectedRun}
        onRetry={handleRetryFailed}
        retryLoading={retryLoading}
      />
    </div>
  );
};

