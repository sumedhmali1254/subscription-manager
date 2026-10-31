import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { FormField } from '../../components/forms/FormField';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { Textarea } from '../../components/forms/Textarea';
import { Switch } from '../../components/forms/Switch';
import { Button } from '../../components/common/Button';
import { BILLING_FREQUENCIES } from '../../constants/status';
import { Layers, DollarSign, Calendar } from 'lucide-react';

export const PlanFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  plan = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 3999,
    currency: 'INR',
    billingFrequency: 'MONTHLY',
    minimumQuantity: 1,
    availableFrom: '2025-01-01',
    availableUntil: '2028-12-31',
    autoCloseAtEnd: false,
    allowEarlyClosure: true,
    allowPause: true,
    allowRenewal: true,
    activeStatus: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        price: plan.price || 0,
        currency: plan.currency || 'INR',
        billingFrequency: plan.billingFrequency || 'MONTHLY',
        minimumQuantity: plan.minimumQuantity || 1,
        availableFrom: plan.availableFrom || '2025-01-01',
        availableUntil: plan.availableUntil || '2028-12-31',
        autoCloseAtEnd: !!plan.autoCloseAtEnd,
        allowEarlyClosure: plan.allowEarlyClosure !== false,
        allowPause: plan.allowPause !== false,
        allowRenewal: plan.allowRenewal !== false,
        activeStatus: plan.activeStatus !== false,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 3999,
        currency: 'INR',
        billingFrequency: 'MONTHLY',
        minimumQuantity: 1,
        availableFrom: '2025-01-01',
        availableUntil: '2028-12-31',
        autoCloseAtEnd: false,
        allowEarlyClosure: true,
        allowPause: true,
        allowRenewal: true,
        activeStatus: true,
      });
    }
    setErrors({});
  }, [plan, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Plan name is required';
    if (formData.price === '' || Number(formData.price) <= 0) newErrors.price = 'Valid price is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      price: Number(formData.price),
      minimumQuantity: Number(formData.minimumQuantity || 1),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={plan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
      subtitle="Define pricing tiers, billing cycles, and customer self-service policies"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Plan Name" required error={errors.name}>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Professional Business"
              icon={Layers}
            />
          </FormField>

          <FormField label="Billing Frequency">
            <Select
              value={formData.billingFrequency}
              onChange={(e) => handleChange('billingFrequency', e.target.value)}
              options={BILLING_FREQUENCIES}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Price (INR ₹)" required error={errors.price}>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="3999"
              icon={DollarSign}
            />
          </FormField>

          <FormField label="Currency">
            <Select
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              options={[
                { value: 'INR', label: 'INR (₹)' },
                { value: 'USD', label: 'USD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
              ]}
            />
          </FormField>

          <FormField label="Minimum Quantity">
            <Input
              type="number"
              value={formData.minimumQuantity}
              onChange={(e) => handleChange('minimumQuantity', e.target.value)}
              placeholder="1"
            />
          </FormField>
        </div>

        <FormField label="Plan Summary & Entitlements">
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Value proposition, user seats included, support SLA..."
            rows={2}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Available From Date">
            <Input
              type="date"
              value={formData.availableFrom}
              onChange={(e) => handleChange('availableFrom', e.target.value)}
              icon={Calendar}
            />
          </FormField>

          <FormField label="Available Until Date">
            <Input
              type="date"
              value={formData.availableUntil}
              onChange={(e) => handleChange('availableUntil', e.target.value)}
              icon={Calendar}
            />
          </FormField>
        </div>

        {/* Plan Configuration Policies */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <h4 className="text-xs font-bold text-[#202744] uppercase tracking-wider font-heading">
            Lifecycle & Contract Policies
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <Switch
              label="Allow Pause"
              description="Customer can temporarily suspend billing"
              checked={formData.allowPause}
              onChange={(val) => handleChange('allowPause', val)}
            />
            <Switch
              label="Allow Renewal"
              description="Automatic or manual period extension"
              checked={formData.allowRenewal}
              onChange={(val) => handleChange('allowRenewal', val)}
            />
            <Switch
              label="Allow Early Closure"
              description="Permit customer to cancel prior to term"
              checked={formData.allowEarlyClosure}
              onChange={(val) => handleChange('allowEarlyClosure', val)}
            />
            <Switch
              label="Auto Close At Term End"
              description="Do not auto-generate renewal cycle"
              checked={formData.autoCloseAtEnd}
              onChange={(val) => handleChange('autoCloseAtEnd', val)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7EAF0]">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {plan ? 'Update Plan' : 'Save Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

