import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../services/subscriptionService';
import { invoiceService } from '../../services/invoiceService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { FormField } from '../../components/forms/FormField';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  Repeat,
  Building,
  Calendar,
  CreditCard,
  Plus,
  Trash2,
  Receipt,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const SubscriptionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sub, setSub] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Add-on modal
  const [isAddOnModalOpen, setIsAddOnModalOpen] = useState(false);
  const [addOnName, setAddOnName] = useState('');
  const [addOnPrice, setAddOnPrice] = useState(500);

  // Close/cancel dialog
  const [confirmTarget, setConfirmTarget] = useState(null);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const res = await subscriptionService.getById(id);
      setSub(res.data);

      const invRes = await invoiceService.getAll({ customerId: res.data.customerId });
      setInvoices(invRes.data.filter(i => i.subscriptionId === res.data.id || i.subscriptionNumber === res.data.subscriptionNumber));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [id]);

  const handleStateTransition = async (newStatus) => {
    setActionLoading(true);
    try {
      await subscriptionService.transitionStatus(id, newStatus);
      fetchSubscription();
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenew = async () => {
    setActionLoading(true);
    try {
      await subscriptionService.renewSubscription(id);
      fetchSubscription();
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateInvoice = async () => {
    setActionLoading(true);
    try {
      const res = await subscriptionService.generateInvoice(id);
      alert(`Success! Generated Recurring Invoice ${res.data.id}`);
      fetchSubscription();
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddAddOn = async (e) => {
    e.preventDefault();
    if (!addOnName.trim()) return;

    setActionLoading(true);
    try {
      await subscriptionService.addAddOn(id, {
        name: addOnName,
        price: Number(addOnPrice),
      });
      setIsAddOnModalOpen(false);
      setAddOnName('');
      fetchSubscription();
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAddOn = async (addOnId) => {
    setActionLoading(true);
    try {
      await subscriptionService.removeAddOn(id, addOnId);
      fetchSubscription();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-xs text-slate-400">Loading subscription...</div>;
  if (!sub) return <div className="p-8 text-center">Subscription not found</div>;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/subscriptions')}
          className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#5263D9] mb-3 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Subscriptions
        </button>

        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF0FD] border border-indigo-100 flex items-center justify-center text-[#5263D9]">
              <Repeat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-[#202744] font-heading">{sub.subscriptionNumber}</h2>
                <StatusBadge status={sub.status} type="subscription" />
              </div>
              <div className="text-xs text-[#64748B] mt-1 flex items-center gap-2">
                <span className="font-semibold text-slate-800">{sub.customerName}</span>
                <span>•</span>
                <span>{sub.customerCompany}</span>
                <span>•</span>
                <span className="font-semibold text-[#5263D9]">{sub.planName}</span>
              </div>
            </div>
          </div>

          {/* Lifecycle Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {sub.status === 'DRAFT' && (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle2}
                loading={actionLoading}
                onClick={() => handleStateTransition('CONFIRMED')}
              >
                Confirm Subscription
              </Button>
            )}

            {sub.status === 'CONFIRMED' && (
              <Button
                variant="primary"
                size="sm"
                icon={Play}
                loading={actionLoading}
                onClick={() => handleStateTransition('ACTIVE')}
              >
                Activate Subscription
              </Button>
            )}

            {sub.status === 'ACTIVE' && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Receipt}
                  loading={actionLoading}
                  onClick={handleGenerateInvoice}
                >
                  Generate Invoice
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={RotateCcw}
                  loading={actionLoading}
                  onClick={handleRenew}
                >
                  Renew Cycle
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Pause}
                  loading={actionLoading}
                  onClick={() => handleStateTransition('PAUSED')}
                >
                  Pause
                </Button>
                <Button
                  variant="dangerOutline"
                  size="sm"
                  icon={XCircle}
                  onClick={() => setConfirmTarget('CLOSED')}
                >
                  Close
                </Button>
              </>
            )}

            {sub.status === 'PAUSED' && (
              <Button
                variant="primary"
                size="sm"
                icon={Play}
                loading={actionLoading}
                onClick={() => handleStateTransition('ACTIVE')}
              >
                Resume Subscription
              </Button>
            )}

            {sub.status === 'CLOSED' && (
              <Button
                variant="secondary"
                size="sm"
                icon={RotateCcw}
                loading={actionLoading}
                onClick={() => handleStateTransition('ACTIVE')}
              >
                Reactivate
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Details & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Commercial Details & Customer */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Commercial Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[#64748B] block font-medium">Recurring Rate</span>
                <div className="text-3xl font-extrabold font-heading text-[#202744] mt-1">
                  {formatCurrency(sub.totalAmount)}
                  <span className="text-xs font-normal text-slate-500 ml-1">/{sub.billingFrequency.toLowerCase()}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Base: {formatCurrency(sub.amount)} • Tax (18%): {formatCurrency(sub.taxAmount)}
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Billing Frequency:</span>
                  <span className="font-semibold text-[#202744]">{sub.billingFrequency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Contract Start:</span>
                  <span className="font-medium text-[#202744]">{formatDate(sub.startDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Term Expiry:</span>
                  <span className="font-medium text-[#202744]">{formatDate(sub.endDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Next Billing Date:</span>
                  <span className="font-bold text-[#5263D9]">{formatDate(sub.nextBillingDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Payment Terms:</span>
                  <span className="font-medium text-[#202744]">{sub.paymentTerms || 'NET 15'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="font-bold text-[#202744] text-sm">{sub.customerName}</div>
              <div className="text-slate-600 font-medium">{sub.customerCompany}</div>
              <div className="text-slate-500">{sub.customerEmail}</div>
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate(`/customers/${sub.customerId}`)}
                  className="text-xs font-semibold text-[#5263D9] hover:underline"
                >
                  View full customer profile →
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Entitlements, Add-ons & Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Core Plan Product Lines */}
          <Card>
            <CardHeader>
              <CardTitle>Core Plan Entitlements</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E7EAF0] text-[#64748B] text-[11px] uppercase">
                      <th className="py-2.5 px-4 font-semibold">Product Description</th>
                      <th className="py-2.5 px-4 font-semibold text-center">Qty</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Unit Rate</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(sub.lines || []).map((line, i) => (
                      <tr key={line.id || i}>
                        <td className="py-3 px-4 font-semibold text-[#202744]">{line.productName}</td>
                        <td className="py-3 px-4 text-center font-medium">{line.quantity}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600">{formatCurrency(line.unitPrice)}</td>
                        <td className="py-3 px-4 text-right font-bold text-[#202744]">{formatCurrency(line.total || line.unitPrice * line.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Add-ons Management */}
          <Card>
            <CardHeader
              action={
                <Button
                  size="xs"
                  variant="secondary"
                  icon={Plus}
                  onClick={() => setIsAddOnModalOpen(true)}
                >
                  Attach Add-on
                </Button>
              }
            >
              <CardTitle>Active Add-ons & Capacity Upgrades</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {(!sub.addOns || sub.addOns.length === 0) ? (
                <div className="p-6 text-center text-xs text-[#64748B]">
                  No optional add-ons attached to this recurring subscription.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {sub.addOns.map((addon) => (
                    <div key={addon.id} className="p-4 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#202744] block">{addon.name}</span>
                        <span className="text-[11px] text-[#64748B]">Attached on {formatDate(addon.addedDate)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-[#5263D9]">{formatCurrency(addon.price)}/mo</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAddOn(addon.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Remove add-on"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recurring Invoices Generated ({invoices.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {invoices.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#64748B]">
                  No invoices generated yet. Click "Generate Invoice" above to generate the first bill.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E7EAF0] text-[#64748B] text-[11px] uppercase">
                        <th className="py-2.5 px-4 font-semibold">Invoice #</th>
                        <th className="py-2.5 px-4 font-semibold">Date</th>
                        <th className="py-2.5 px-4 font-semibold">Due Date</th>
                        <th className="py-2.5 px-4 font-semibold">Amount</th>
                        <th className="py-2.5 px-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.map((inv) => (
                        <tr
                          key={inv.id}
                          onClick={() => navigate(`/invoices/${inv.id}`)}
                          className="hover:bg-slate-50 cursor-pointer"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-[#202744]">{inv.invoiceNumber}</td>
                          <td className="py-3 px-4 text-slate-600">{formatDate(inv.invoiceDate)}</td>
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
        </div>
      </div>

      {/* Attach Add-on Modal */}
      <Modal
        isOpen={isAddOnModalOpen}
        onClose={() => setIsAddOnModalOpen(false)}
        title="Attach Add-on to Subscription"
        subtitle="Expands monthly contract capacity and recalculates recurring total"
      >
        <form onSubmit={handleAddAddOn} className="space-y-4">
          <FormField label="Add-on Name" required>
            <Input
              value={addOnName}
              onChange={(e) => setAddOnName(e.target.value)}
              placeholder="e.g. Additional 200 GB Storage or 5 User Seats"
            />
          </FormField>

          <FormField label="Monthly Recurring Price (INR ₹)" required>
            <Input
              type="number"
              value={addOnPrice}
              onChange={(e) => setAddOnPrice(Number(e.target.value))}
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF0]">
            <Button variant="secondary" onClick={() => setIsAddOnModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={actionLoading}>
              Add to Subscription
            </Button>
          </div>
        </form>
      </Modal>

      {/* Close / Cancel Confirmation */}
      <ConfirmationDialog
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        onConfirm={async () => {
          await handleStateTransition('CLOSED');
          setConfirmTarget(null);
        }}
        title="Close Subscription"
        message="Closing this subscription will immediately halt recurring invoice generation for this client."
        confirmLabel="Close Subscription"
        confirmVariant="danger"
        loading={actionLoading}
      />
    </div>
  );
};

