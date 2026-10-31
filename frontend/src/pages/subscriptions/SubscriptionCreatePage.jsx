import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscriptionService } from '../../services/subscriptionService';
import { customerService } from '../../services/customerService';
import { planService } from '../../services/planService';
import { productService } from '../../services/productService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { FormField } from '../../components/forms/FormField';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';
import { BILLING_FREQUENCIES } from '../../constants/status';
import { ArrowLeft, Repeat, Calendar, DollarSign, Plus } from 'lucide-react';

export const SubscriptionCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [customerId, setCustomerId] = useState(searchParams.get('customerId') || '');
  const [planId, setPlanId] = useState(searchParams.get('planId') || '');
  const [billingFrequency, setBillingFrequency] = useState('MONTHLY');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentTerms, setPaymentTerms] = useState('NET 15');
  const [amount, setAmount] = useState(3999);

  useEffect(() => {
    const loadDependencies = async () => {
      const [cRes, pRes, prRes] = await Promise.all([
        customerService.getAll(),
        planService.getAll(),
        productService.getAll(),
      ]);
      setCustomers(cRes.data);
      setPlans(pRes.data);
      setProducts(prRes.data);

      if (!customerId && cRes.data.length) setCustomerId(cRes.data[0].id);
      if (!planId && pRes.data.length) {
        setPlanId(pRes.data[0].id);
        setAmount(pRes.data[0].price);
        setBillingFrequency(pRes.data[0].billingFrequency);
      }
    };
    loadDependencies();
  }, []);

  const handlePlanSelect = (selectedId) => {
    setPlanId(selectedId);
    const p = plans.find(plan => plan.id === selectedId);
    if (p) {
      setAmount(p.price);
      setBillingFrequency(p.billingFrequency);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId || !planId) {
      alert('Please select customer and plan');
      return;
    }

    const customer = customers.find(c => c.id === customerId);
    const plan = plans.find(p => p.id === planId);

    const netAmount = Number(amount || 0);
    const taxAmount = netAmount * 0.18;
    const totalAmount = netAmount + taxAmount;

    setLoading(true);
    try {
      const payload = {
        customerId,
        customerName: customer?.name || 'Customer',
        customerCompany: customer?.company || 'Company',
        customerEmail: customer?.email || '',
        planId,
        planName: plan?.name || 'Subscription Plan',
        billingFrequency,
        status: 'ACTIVE',
        amount: netAmount,
        taxAmount,
        discountAmount: 0,
        totalAmount,
        currency: 'INR',
        startDate,
        endDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().slice(0, 10),
        nextBillingDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0, 10),
        paymentTerms,
        autoRenew: true,
        lines: [
          {
            id: `SL-${Date.now()}`,
            productName: `${plan?.name} Core Software`,
            quantity: 1,
            unitPrice: netAmount,
            taxRate: 18,
            total: totalAmount,
          }
        ],
        addOns: [],
      };

      const res = await subscriptionService.create(payload);
      navigate(`/subscriptions/${res.data.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <button
          type="button"
          onClick={() => navigate('/subscriptions')}
          className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#5263D9] mb-3 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Subscriptions
        </button>
        <PageHeader
          title="Create New Subscription"
          subtitle="Provision recurring license agreement for corporate customer."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Agreement Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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

              <FormField label="Subscription Plan Tier" required>
                <Select
                  value={planId}
                  onChange={(e) => handlePlanSelect(e.target.value)}
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price)}/{p.billingFrequency})</option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Base Recurring Amount (INR ₹)" required>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  icon={DollarSign}
                />
              </FormField>

              <FormField label="Billing Frequency">
                <Select
                  value={billingFrequency}
                  onChange={(e) => setBillingFrequency(e.target.value)}
                  options={BILLING_FREQUENCIES}
                />
              </FormField>

              <FormField label="Contract Start Date">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  icon={Calendar}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Payment Terms">
                <Select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  options={[
                    { value: 'Immediate', label: 'Immediate Due' },
                    { value: 'NET 15', label: 'NET 15' },
                    { value: 'NET 30', label: 'NET 30' },
                  ]}
                />
              </FormField>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[#64748B] block text-[11px]">Total with GST 18%:</span>
                  <span className="text-base font-bold text-[#5263D9] font-heading">
                    {formatCurrency(Number(amount) * 1.18)}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  Auto-renews
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7EAF0]">
              <Button variant="secondary" onClick={() => navigate('/subscriptions')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={loading} icon={Plus}>
                Activate Subscription
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

