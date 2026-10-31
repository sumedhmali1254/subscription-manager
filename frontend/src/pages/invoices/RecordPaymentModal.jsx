import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { FormField } from '../../components/forms/FormField';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { Textarea } from '../../components/forms/Textarea';
import { Button } from '../../components/common/Button';
import { PAYMENT_METHODS } from '../../constants/status';
import { formatCurrency } from '../../utils/formatters';
import { CreditCard, DollarSign, Calendar, Hash } from 'lucide-react';

export const RecordPaymentModal = ({
  isOpen,
  onClose,
  invoice,
  onSubmit,
  loading = false,
}) => {
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (invoice) {
      setAmount(invoice.outstandingBalance || invoice.totalAmount || 0);
      setTransactionId(`TXN-${Date.now().toString().slice(-6)}`);
      setPaymentDate(new Date().toISOString().slice(0, 10));
      setNotes(`Settlement for ${invoice.invoiceNumber}`);
      setError('');
    }
  }, [invoice, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid positive payment amount.');
      return;
    }
    if (invoice && num > invoice.outstandingBalance) {
      setError(`Amount cannot exceed the current outstanding balance of ${formatCurrency(invoice.outstandingBalance)}`);
      return;
    }

    onSubmit({
      amount: num,
      paymentMethod,
      transactionId,
      paymentDate,
      notes,
    });
  };

  if (!invoice) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Payment for ${invoice.invoiceNumber}`}
      subtitle={`Customer: ${invoice.customerName} (${invoice.customerCompany})`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Outstanding Balance Banner */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-slate-500 block text-[11px]">Outstanding Balance Due:</span>
            <span className="text-lg font-bold text-rose-600 font-heading">
              {formatCurrency(invoice.outstandingBalance)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block text-[11px]">Total Invoice:</span>
            <span className="font-semibold text-slate-700">{formatCurrency(invoice.totalAmount)}</span>
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <FormField label="Payment Amount (INR ₹)" required>
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            icon={DollarSign}
            placeholder="0.00"
          />
          <p className="text-[11px] text-[#64748B] mt-1">
            Support partial payments. Enter partial amount if customer paid less than full balance.
          </p>
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Payment Method" required>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={PAYMENT_METHODS}
            />
          </FormField>

          <FormField label="Payment Date" required>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              icon={Calendar}
            />
          </FormField>
        </div>

        <FormField label="Transaction / UTR Reference ID">
          <Input
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="e.g. HDFC-NEFT-991288 or UPI/..."
            icon={Hash}
          />
        </FormField>

        <FormField label="Internal Notes & Receipt Details">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF0]">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} icon={CreditCard}>
            Confirm Payment Receipt
          </Button>
        </div>
      </form>
    </Modal>
  );
};

