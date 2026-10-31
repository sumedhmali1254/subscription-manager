import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService } from '../../services/invoiceService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RecordPaymentModal } from './RecordPaymentModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  Printer,
  CreditCard,
  Send,
  Building,
  CheckCircle2,
  Calendar,
  XCircle,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const res = await invoiceService.getById(id);
      setInvoice(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleRecordPayment = async (data) => {
    setPaymentLoading(true);
    try {
      await invoiceService.recordPayment(invoice.id, data);
      setIsPaymentModalOpen(false);
      fetchInvoice();
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      await invoiceService.send(invoice.id);
      toast.success(`Invoice emailed to ${invoice.customerEmail}`);
    } catch (e) {
      toast.error('Failed to send invoice');
    }
  };

  const handleCancelInvoice = async () => {
    if (!confirm('Are you sure you want to cancel this invoice?')) return;
    try {
      await invoiceService.cancel(invoice.id);
      fetchInvoice();
    } catch (e) {
      toast.error('Failed to cancel');
    }
  };

  if (loading) return <div className="p-8 text-center text-xs text-slate-400">Loading invoice...</div>;
  if (!invoice) return <div className="p-8 text-center">Invoice not found</div>;

  return (
    <div className="space-y-6">
      {/* Action Controls Bar (No-Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/invoices')}
          className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#5263D9] font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Invoices
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print / Download PDF
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={Send}
            onClick={handleSendEmail}
          >
            Send Email
          </Button>

          {invoice.outstandingBalance > 0 && invoice.status !== 'CANCELLED' && (
            <Button
              variant="primary"
              size="sm"
              icon={CreditCard}
              onClick={() => setIsPaymentModalOpen(true)}
            >
              Record Payment
            </Button>
          )}

          {invoice.status !== 'CANCELLED' && invoice.status !== 'PAID' && (
            <Button
              variant="dangerOutline"
              size="sm"
              icon={XCircle}
              onClick={handleCancelInvoice}
            >
              Cancel Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Official Tax Invoice Sheet */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] p-8 sm:p-12 shadow-card max-w-4xl mx-auto print-shadow-none">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b border-slate-200 gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5263D9] flex items-center justify-center text-white font-extrabold text-xl font-heading">
                R
              </div>
              <div>
                <span className="font-bold text-lg text-[#202744] font-heading tracking-wider block">
                  RECURIX
                </span>
                <span className="text-[10px] text-[#5263D9] font-bold uppercase tracking-wider block">
                  Brightloop Software Pvt Ltd
                </span>
              </div>
            </div>
            <p className="text-xs text-[#64748B] pt-2 max-w-xs leading-relaxed">
              Tower B, 7th Floor, Global Technology Park, Outer Ring Road, Bengaluru, Karnataka 560103<br />
              GSTIN: 29AAACB1234D1Z8 • PAN: AAACB1234D<br />
              Email: billing@brightloop.io
            </p>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="text-2xl font-extrabold font-heading text-[#202744] tracking-tight block">
              TAX INVOICE
            </span>
            <div className="font-mono text-sm font-bold text-[#5263D9]">
              {invoice.invoiceNumber}
            </div>
            <div className="pt-2">
              <StatusBadge status={invoice.status} type="invoice" />
            </div>
          </div>
        </div>

        {/* Bill To & Invoice Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-slate-200 text-xs">
          <div>
            <span className="text-[#64748B] uppercase font-bold tracking-wider text-[10px] block mb-1">
              Billed To:
            </span>
            <h4 className="text-sm font-bold text-[#202744]">{invoice.customerName}</h4>
            <p className="font-semibold text-slate-700">{invoice.customerCompany}</p>
            <p className="text-slate-500 mt-0.5">{invoice.customerEmail}</p>
          </div>

          <div className="sm:text-right space-y-1.5">
            <div>
              <span className="text-[#64748B]">Invoice Date: </span>
              <span className="font-semibold text-[#202744]">{formatDate(invoice.invoiceDate)}</span>
            </div>
            <div>
              <span className="text-[#64748B]">Payment Due Date: </span>
              <span className="font-semibold text-rose-600">{formatDate(invoice.dueDate)}</span>
            </div>
            {invoice.subscriptionNumber && (
              <div>
                <span className="text-[#64748B]">Subscription Ref: </span>
                <span className="font-mono font-semibold text-[#5263D9]">{invoice.subscriptionNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Items Table */}
        <div className="py-6 border-b border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[#64748B] text-[11px] uppercase">
                <th className="py-3 px-2 font-semibold">Item & Description</th>
                <th className="py-3 px-2 font-semibold text-center">Qty</th>
                <th className="py-3 px-2 font-semibold text-right">Unit Rate</th>
                <th className="py-3 px-2 font-semibold text-right">Tax (GST)</th>
                <th className="py-3 px-2 font-semibold text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(invoice.items || []).map((itm, i) => (
                <tr key={i}>
                  <td className="py-3.5 px-2">
                    <div className="font-semibold text-[#202744]">{itm.description}</div>
                  </td>
                  <td className="py-3.5 px-2 text-center font-medium">{itm.quantity}</td>
                  <td className="py-3.5 px-2 text-right font-mono text-slate-700">{formatCurrency(itm.unitPrice)}</td>
                  <td className="py-3.5 px-2 text-right text-slate-500">{itm.taxRate}%</td>
                  <td className="py-3.5 px-2 text-right font-bold text-[#202744]">{formatCurrency(itm.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary & Totals */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between gap-6 text-xs">
          <div className="max-w-md space-y-4">
            <div>
              <span className="font-bold text-[#202744] uppercase tracking-wider text-[10px] block mb-1">
                Settlement Bank Account
              </span>
              <p className="text-[#64748B] leading-relaxed">
                Bank: HDFC Bank Ltd • Whitefield Tech Park Branch<br />
                Account Name: Brightloop Software Private Limited<br />
                Account Number: 50200088991122 • IFSC: HDFC0001234
              </p>
            </div>

            {/* Payment History Log */}
            {invoice.paymentHistory?.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-[#202744] block mb-1.5">Payment Allocations:</span>
                <div className="space-y-1">
                  {invoice.paymentHistory.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>{formatDate(p.date)} via {p.method} ({p.reference})</span>
                      <span className="font-bold text-emerald-600">+{formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-full sm:w-64 space-y-2 text-right">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-[#202744]">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST Tax Amount:</span>
              <span className="font-semibold text-[#202744]">{formatCurrency(invoice.taxAmount)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount:</span>
                <span>-{formatCurrency(invoice.discountAmount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-[#202744]">
              <span>Total Invoice Amount:</span>
              <span>{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Amount Paid:</span>
              <span>{formatCurrency(invoice.amountPaid)}</span>
            </div>
            <div className="pt-2 border-t border-slate-300 flex justify-between text-base font-extrabold text-rose-600 font-heading">
              <span>Balance Due:</span>
              <span>{formatCurrency(invoice.outstandingBalance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoice={invoice}
        onSubmit={handleRecordPayment}
        loading={paymentLoading}
      />
    </div>
  );
};

