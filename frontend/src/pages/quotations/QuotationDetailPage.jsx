import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quotationService } from '../../services/quotationService';
import { Card, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Repeat,
  Printer,
  Download,
  Building,
  Mail,
  Calendar,
} from 'lucide-react';

export const QuotationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchQuotation = async () => {
    setLoading(true);
    try {
      const res = await quotationService.getById(id);
      setQuotation(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const handleSend = async () => {
    setActionLoading(true);
    try {
      await quotationService.sendQuotation(id);
      fetchQuotation();
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      await quotationService.confirmQuotation(id);
      fetchQuotation();
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToSubscription = async () => {
    setActionLoading(true);
    try {
      const res = await quotationService.convertToSubscription(id);
      alert(`Success! Quotation converted into Subscription ${res.data.id}`);
      navigate(`/subscriptions/${res.data.id}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-xs text-slate-400">Loading quotation...</div>;
  if (!quotation) return <div className="p-8 text-center">Quotation not found</div>;

  return (
    <div className="space-y-6">
      {/* Top Action Controls (hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/quotations')}
          className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#5263D9] font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Quotations
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print / PDF
          </Button>

          {quotation.status === 'DRAFT' && (
            <Button
              variant="secondary"
              size="sm"
              icon={Send}
              loading={actionLoading}
              onClick={handleSend}
            >
              Send to Customer
            </Button>
          )}

          {quotation.status === 'SENT' && (
            <Button
              variant="secondary"
              size="sm"
              icon={CheckCircle2}
              loading={actionLoading}
              onClick={handleConfirm}
            >
              Mark Confirmed
            </Button>
          )}

          {quotation.status === 'CONFIRMED' && (
            <Button
              variant="primary"
              size="sm"
              icon={Repeat}
              loading={actionLoading}
              onClick={handleConvertToSubscription}
            >
              Convert to Subscription
            </Button>
          )}

          {quotation.status === 'CONVERTED' && quotation.convertedSubscriptionId && (
            <Button
              variant="secondary"
              size="sm"
              icon={Repeat}
              onClick={() => navigate(`/subscriptions/${quotation.convertedSubscriptionId}`)}
            >
              View Subscription ({quotation.convertedSubscriptionId})
            </Button>
          )}
        </div>
      </div>

      {/* Printable Business Quotation Document */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] p-8 sm:p-12 shadow-card max-w-4xl mx-auto print-shadow-none">
        {/* Header: Company & Quotation Metadata */}
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
              GSTIN: 29AAACB1234D1Z8 • billing@brightloop.io
            </p>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="text-2xl font-extrabold font-heading text-[#202744] tracking-tight block">
              QUOTATION
            </span>
            <div className="font-mono text-sm font-bold text-[#5263D9]">
              {quotation.quotationNumber}
            </div>
            <div className="pt-2">
              <StatusBadge status={quotation.status} type="quotation" />
            </div>
          </div>
        </div>

        {/* Customer & Date Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-slate-200 text-xs">
          <div>
            <span className="text-[#64748B] uppercase font-bold tracking-wider text-[10px] block mb-1">
              Quotation Prepared For:
            </span>
            <h4 className="text-sm font-bold text-[#202744]">{quotation.customerName}</h4>
            <p className="font-semibold text-slate-700">{quotation.customerCompany}</p>
            <p className="text-slate-500 mt-1">{quotation.customerEmail}</p>
          </div>

          <div className="sm:text-right space-y-1.5">
            <div>
              <span className="text-[#64748B]">Quotation Date: </span>
              <span className="font-semibold text-[#202744]">{formatDate(quotation.quotationDate)}</span>
            </div>
            <div>
              <span className="text-[#64748B]">Valid Until (Expiry): </span>
              <span className="font-semibold text-rose-600">{formatDate(quotation.expiryDate)}</span>
            </div>
            <div>
              <span className="text-[#64748B]">Payment Terms: </span>
              <span className="font-semibold text-[#202744]">{quotation.paymentTerms || 'NET 15'}</span>
            </div>
          </div>
        </div>

        {/* Product Lines Table */}
        <div className="py-6 border-b border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[#64748B] text-[11px] uppercase">
                <th className="py-3 px-2 font-semibold">Description / Product</th>
                <th className="py-3 px-2 font-semibold text-center">Qty</th>
                <th className="py-3 px-2 font-semibold text-right">Unit Price</th>
                <th className="py-3 px-2 font-semibold text-right">Tax Rate</th>
                <th className="py-3 px-2 font-semibold text-right">Total (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(quotation.lines || []).map((l, i) => (
                <tr key={i}>
                  <td className="py-3 px-2">
                    <div className="font-semibold text-[#202744]">{l.productName}</div>
                    {l.variantName && <div className="text-[11px] text-[#64748B]">{l.variantName}</div>}
                  </td>
                  <td className="py-3 px-2 text-center font-medium">{l.quantity}</td>
                  <td className="py-3 px-2 text-right font-mono text-slate-700">{formatCurrency(l.unitPrice)}</td>
                  <td className="py-3 px-2 text-right text-slate-500">{l.taxRate}% GST</td>
                  <td className="py-3 px-2 text-right font-bold text-[#202744]">{formatCurrency(l.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Terms */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between gap-6 text-xs">
          <div className="max-w-md space-y-2">
            <span className="font-bold text-[#202744] uppercase tracking-wider text-[10px] block">
              Terms & Special Conditions
            </span>
            <p className="text-[#64748B] leading-relaxed">
              {quotation.notes || 'This quotation is subject to Brightloop Software standard commercial master services agreement. Taxes calculated based on prevailing Indian GST laws.'}
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-right">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-[#202744]">{formatCurrency(quotation.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax (GST 18%):</span>
              <span className="font-semibold text-[#202744]">{formatCurrency(quotation.taxAmount)}</span>
            </div>
            {quotation.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount:</span>
                <span>-{formatCurrency(quotation.discountAmount)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-[#5263D9] font-heading">
              <span>Total:</span>
              <span>{formatCurrency(quotation.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

