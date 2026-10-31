import React from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { PlayCircle, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

export const BillingRunDetailModal = ({
  isOpen,
  onClose,
  run,
  onRetry,
  retryLoading = false,
}) => {
  if (!run) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Billing Run ${run.runNumber || run.id}`}
      subtitle="Automated batch recurring invoice execution breakdown"
      size="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Metric Badges */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <span className="text-slate-500 block text-[11px]">Processed</span>
            <span className="text-xl font-bold text-[#202744] mt-0.5 block">{run.processedCount}</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
            <span className="text-emerald-700 block text-[11px]">Success</span>
            <span className="text-xl font-bold text-emerald-700 mt-0.5 block">{run.successCount}</span>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-center">
            <span className="text-rose-700 block text-[11px]">Failed</span>
            <span className="text-xl font-bold text-rose-700 mt-0.5 block">{run.failureCount}</span>
          </div>
        </div>

        {/* Timestamps */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Started At:</span>
            <span className="font-semibold text-[#202744]">{formatDateTime(run.startedAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Completed At:</span>
            <span className="font-semibold text-[#202744]">{formatDateTime(run.completedAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#64748B]">Execution Status:</span>
            <Badge variant={run.failureCount === 0 ? 'success' : 'warning'} dot>
              {run.status}
            </Badge>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[#64748B] block mb-1">Execution Summary:</span>
            <p className="text-slate-700 leading-relaxed font-mono text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
              {run.errorSummary || 'All invoices generated without errors.'}
            </p>
          </div>
        </div>

        {/* Failed Invoices Table */}
        {run.failedInvoices?.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-600 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                Failed Invoices Awaiting Resolution ({run.failedInvoices.length})
              </span>
              <Button
                size="xs"
                variant="primary"
                icon={RotateCcw}
                loading={retryLoading}
                onClick={() => onRetry(run.id)}
              >
                Retry Failed Items
              </Button>
            </div>

            <div className="border border-rose-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-rose-50/70 border-b border-rose-200 text-rose-900 text-[11px]">
                    <th className="p-2.5">Invoice #</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Amount</th>
                    <th className="p-2.5">Failure Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100 bg-white">
                  {run.failedInvoices.map((fail, i) => (
                    <tr key={i}>
                      <td className="p-2.5 font-mono font-bold text-slate-800">{fail.invoiceNumber}</td>
                      <td className="p-2.5 font-medium text-slate-800">{fail.customer}</td>
                      <td className="p-2.5 font-bold text-rose-600">{formatCurrency(fail.amount)}</td>
                      <td className="p-2.5 text-slate-600">{fail.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-[#E7EAF0]">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

