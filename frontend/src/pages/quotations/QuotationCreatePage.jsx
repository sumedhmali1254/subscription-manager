import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quotationService } from '../../services/quotationService';
import { customerService } from '../../services/customerService';
import { productService } from '../../services/productService';
import { planService } from '../../services/planService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { FormField } from '../../components/forms/FormField';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { Textarea } from '../../components/forms/Textarea';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';
import {
  FileText,
  Plus,
  Trash2,
  Calendar,
  Users,
  Layers,
  ArrowLeft,
  Send,
  Save,
} from 'lucide-react';

export const QuotationCreatePage = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [planId, setPlanId] = useState('');
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10));
  const [paymentTerms, setPaymentTerms] = useState('NET 15');
  const [notes, setNotes] = useState('Standard Master Subscription Agreement terms apply. 18% GST applicable.');
  const [lines, setLines] = useState([
    {
      id: 'QL-01',
      productId: 'PROD-001',
      productName: 'Business Software Suite',
      variantName: 'Standard Edition',
      quantity: 1,
      unitPrice: 2000,
      taxRate: 18,
      subtotal: 2000,
    },
  ]);

  useEffect(() => {
    const loadDependencies = async () => {
      const [cRes, pRes, prRes, tRes] = await Promise.all([
        customerService.getAll(),
        planService.getAll(),
        productService.getAll(),
        quotationService.getTemplates(),
      ]);
      setCustomers(cRes.data);
      setPlans(pRes.data);
      setProducts(prRes.data);
      setTemplates(tRes.data);

      if (cRes.data.length) setCustomerId(cRes.data[0].id);
      if (pRes.data.length) setPlanId(pRes.data[0].id);
    };
    loadDependencies();
  }, []);

  const handleApplyTemplate = (tmplId) => {
    const tmpl = templates.find(t => t.id === tmplId);
    if (!tmpl) return;
    if (tmpl.planId) setPlanId(tmpl.planId);
    if (tmpl.paymentTerms) setPaymentTerms(tmpl.paymentTerms);
    if (tmpl.notes) setNotes(tmpl.notes);
    if (tmpl.validityDays) {
      setExpiryDate(new Date(Date.now() + tmpl.validityDays*24*60*60*1000).toISOString().slice(0, 10));
    }
  };

  const handleAddLine = () => {
    setLines(prev => [
      ...prev,
      {
        id: `QL-${Date.now()}`,
        productId: products[0]?.id || '',
        productName: products[0]?.name || '',
        variantName: products[0]?.variants?.[0]?.name || 'Standard',
        quantity: 1,
        unitPrice: products[0]?.salesPrice || 1000,
        taxRate: 18,
        subtotal: products[0]?.salesPrice || 1000,
      },
    ]);
  };

  const handleRemoveLine = (index) => {
    if (lines.length <= 1) return;
    setLines(prev => prev.filter((_, i) => i !== index));
  };

  const handleLineChange = (index, field, value) => {
    const updated = [...lines];
    updated[index][field] = value;

    if (field === 'productId') {
      const found = products.find(p => p.id === value);
      if (found) {
        updated[index].productName = found.name;
        updated[index].variantName = found.variants?.[0]?.name || 'Standard';
        updated[index].unitPrice = found.salesPrice;
      }
    }

    // Recompute line subtotal
    const qty = Number(updated[index].quantity || 1);
    const price = Number(updated[index].unitPrice || 0);
    updated[index].subtotal = qty * price;

    setLines(updated);
  };

  // Summary computations
  const subtotal = lines.reduce((acc, l) => acc + (Number(l.subtotal) || 0), 0);
  const taxAmount = lines.reduce((acc, l) => acc + ((Number(l.subtotal) || 0) * (Number(l.taxRate) || 0) / 100), 0);
  const discountAmount = 0;
  const totalAmount = subtotal + taxAmount - discountAmount;

  const handleSubmit = async (status = 'DRAFT') => {
    if (!customerId) {
      alert('Please select a customer.');
      return;
    }
    const customer = customers.find(c => c.id === customerId);
    const plan = plans.find(p => p.id === planId);

    setLoading(true);
    try {
      const payload = {
        customerId,
        customerName: customer?.name || 'Customer',
        customerCompany: customer?.company || 'Company',
        customerEmail: customer?.email || '',
        planId,
        planName: plan?.name || 'Custom Subscription',
        quotationDate,
        expiryDate,
        paymentTerms,
        notes,
        lines,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        status,
      };

      const res = await quotationService.create(payload);
      navigate(`/quotations/${res.data.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/quotations')}
          className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#5263D9] mb-3 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Quotations
        </button>
        <PageHeader
          title="Create Quotation"
          subtitle="Generate enterprise proposal with live pricing calculations and customer terms."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Lines */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer & Contract Scope</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Customer Account" required>
                  <Select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Subscription Plan Tier">
                  <Select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price)}/{p.billingFrequency})</option>
                    ))}
                  </Select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Use Template (Optional)">
                  <Select
                    onChange={(e) => handleApplyTemplate(e.target.value)}
                    placeholder="Choose template..."
                  >
                    <option value="">None / Custom Proposal</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Quotation Date">
                  <Input
                    type="date"
                    value={quotationDate}
                    onChange={(e) => setQuotationDate(e.target.value)}
                  />
                </FormField>

                <FormField label="Valid Until (Expiry Date)">
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </FormField>
              </div>

              <FormField label="Payment Terms">
                <Select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  options={[
                    { value: 'Immediate', label: 'Immediate Payment Due' },
                    { value: 'NET 15', label: 'NET 15 (15 Days Grace)' },
                    { value: 'NET 30', label: 'NET 30 (30 Days Grace)' },
                    { value: 'NET 45', label: 'NET 45 (Corporate Procurement)' },
                  ]}
                />
              </FormField>
            </CardContent>
          </Card>

          {/* Product Line Items */}
          <Card>
            <CardHeader
              action={
                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  icon={Plus}
                  onClick={handleAddLine}
                >
                  Add Line Item
                </Button>
              }
            >
              <CardTitle>Quotation Items & Product Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E7EAF0] text-[#64748B] text-[11px] uppercase">
                      <th className="py-2.5 px-4 font-semibold w-5/12">Product & Variant</th>
                      <th className="py-2.5 px-3 font-semibold w-24">Qty</th>
                      <th className="py-2.5 px-3 font-semibold w-28">Unit Price</th>
                      <th className="py-2.5 px-3 font-semibold w-20">Tax %</th>
                      <th className="py-2.5 px-4 font-semibold w-28 text-right">Line Total</th>
                      <th className="py-2.5 px-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lines.map((line, idx) => (
                      <tr key={line.id || idx}>
                        <td className="py-3 px-4">
                          <select
                            value={line.productId}
                            onChange={(e) => handleLineChange(idx, 'productId', e.target.value)}
                            className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white mb-1"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Variant specification"
                            value={line.variantName}
                            onChange={(e) => handleLineChange(idx, 'variantName', e.target.value)}
                            className="w-full text-[11px] px-2 py-1 rounded border border-slate-200 text-slate-600"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) => handleLineChange(idx, 'quantity', Number(e.target.value))}
                            className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            value={line.unitPrice}
                            onChange={(e) => handleLineChange(idx, 'unitPrice', Number(e.target.value))}
                            className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            value={line.taxRate}
                            onChange={(e) => handleLineChange(idx, 'taxRate', Number(e.target.value))}
                            className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white"
                          />
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#202744]">
                          {formatCurrency(line.subtotal)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            type="button"
                            disabled={lines.length <= 1}
                            onClick={() => handleRemoveLine(idx)}
                            className="text-slate-400 hover:text-rose-600 disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Notes & Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Summary Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Proposal Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal (Net):</span>
                <span className="font-semibold text-[#202744]">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Estimated GST Tax (18%):</span>
                <span className="font-semibold text-[#202744]">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Special Discounts:</span>
                <span className="font-semibold text-emerald-600">-₹0.00</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                <span className="text-sm font-bold text-[#202744]">Total Quotation Amount:</span>
                <span className="text-xl font-extrabold text-[#5263D9] font-heading">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  loading={loading}
                  icon={Send}
                  onClick={() => handleSubmit('SENT')}
                >
                  Save & Send Quotation
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  disabled={loading}
                  icon={Save}
                  onClick={() => handleSubmit('DRAFT')}
                >
                  Save as Draft
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

