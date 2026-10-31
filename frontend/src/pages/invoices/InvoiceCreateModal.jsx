import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { FormField } from '../../components/forms/FormField';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { Textarea } from '../../components/forms/Textarea';
import { Button } from '../../components/common/Button';
import { customerService } from '../../services/customerService';
import { formatCurrency } from '../../utils/formatters';
import { DollarSign, Calendar, Plus, Trash2 } from 'lucide-react';

export const InvoiceCreateModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 15*24*60*60*1000).toISOString().slice(0, 10));
  const [items, setItems] = useState([
    { id: 'ITM-01', description: 'Enterprise Software Subscription', quantity: 1, unitPrice: 3999, taxRate: 18 }
  ]);

  useEffect(() => {
    if (isOpen) {
      customerService.getAll().then(res => {
        setCustomers(res.data);
        if (res.data.length) setCustomerId(res.data[0].id);
      });
    }
  }, [isOpen]);

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { id: `ITM-${Date.now()}`, description: 'Add-on module or consulting', quantity: 1, unitPrice: 1500, taxRate: 18 }
    ]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, itm) => acc + (Number(itm.quantity || 1) * Number(itm.unitPrice || 0)), 0);
  const taxAmount = items.reduce((acc, itm) => acc + (Number(itm.quantity || 1) * Number(itm.unitPrice || 0) * (Number(itm.taxRate || 0) / 100)), 0);
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === customerId);

    onSubmit({
      customerId,
      customerName: customer?.name || 'Customer',
      customerCompany: customer?.company || 'Company',
      customerEmail: customer?.email || '',
      invoiceDate,
      dueDate,
      subtotal,
      taxAmount,
      totalAmount,
      items: items.map(i => ({
        ...i,
        amount: Number(i.quantity) * Number(i.unitPrice),
      })),
      status: 'CONFIRMED',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Direct Business Invoice"
      subtitle="Generates an official tax invoice for software subscriptions or services"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <FormField label="Select Customer" required>
          <Select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
            ))}
          </Select>
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Invoice Date">
            <Input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </FormField>
          <FormField label="Due Date">
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </FormField>
        </div>

        {/* Invoice Items */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[#202744] uppercase tracking-wider text-[10px]">
              Billable Line Items
            </span>
            <Button type="button" variant="secondary" size="xs" icon={Plus} onClick={handleAddItem}>
              Add Item
            </Button>
          </div>

          <div className="space-y-2">
            {items.map((itm, i) => (
              <div key={itm.id || i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  placeholder="Item description"
                  value={itm.description}
                  onChange={(e) => handleItemChange(i, 'description', e.target.value)}
                  className="w-full sm:flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={itm.quantity}
                  onChange={(e) => handleItemChange(i, 'quantity', Number(e.target.value))}
                  className="w-full sm:w-16 text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
                <input
                  type="number"
                  placeholder="Unit Price"
                  value={itm.unitPrice}
                  onChange={(e) => handleItemChange(i, 'unitPrice', Number(e.target.value))}
                  className="w-full sm:w-28 text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                />
                <button
                  type="button"
                  disabled={items.length <= 1}
                  onClick={() => handleRemoveItem(i)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <span className="font-semibold text-slate-700">Calculated Invoice Total (with GST):</span>
          <span className="text-lg font-bold text-[#5263D9]">{formatCurrency(totalAmount)}</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF0]">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Issue Invoice
          </Button>
        </div>
      </form>
    </Modal>
  );
};

