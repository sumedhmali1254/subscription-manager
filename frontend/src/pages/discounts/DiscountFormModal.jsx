import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { FormField } from '../../components/forms/FormField';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { Button } from '../../components/common/Button';
import { Percent, DollarSign, Calendar, Hash } from 'lucide-react';

export const DiscountFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  discount = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    discountName: '',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minimumPurchase: 1000,
    minimumQuantity: 1,
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    usageLimit: 100,
    applicationScope: 'ENTIRE_SUBSCRIPTION',
    activeStatus: true,
  });

  useEffect(() => {
    if (discount) {
      setFormData({
        discountName: discount.discountName || '',
        discountType: discount.discountType || 'PERCENTAGE',
        discountValue: discount.discountValue || 0,
        minimumPurchase: discount.minimumPurchase || 0,
        minimumQuantity: discount.minimumQuantity || 1,
        validFrom: discount.validFrom || '2026-01-01',
        validUntil: discount.validUntil || '2026-12-31',
        usageLimit: discount.usageLimit || 100,
        applicationScope: discount.applicationScope || 'ENTIRE_SUBSCRIPTION',
        activeStatus: discount.activeStatus !== false,
      });
    } else {
      setFormData({
        discountName: '',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minimumPurchase: 1000,
        minimumQuantity: 1,
        validFrom: '2026-01-01',
        validUntil: '2026-12-31',
        usageLimit: 100,
        applicationScope: 'ENTIRE_SUBSCRIPTION',
        activeStatus: true,
      });
    }
  }, [discount, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.discountName.trim()) {
      alert('Discount coupon code is required.');
      return;
    }
    onSubmit({
      ...formData,
      discountValue: Number(formData.discountValue),
      minimumPurchase: Number(formData.minimumPurchase || 0),
      usageLimit: Number(formData.usageLimit || 100),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={discount ? 'Edit Discount Rule' : 'Create Promotion / Discount'}
      subtitle="Promotional campaign codes and enterprise discount waivers"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <FormField label="Discount Code / Rule Name" required>
          <Input
            value={formData.discountName}
            onChange={(e) => setFormData({ ...formData, discountName: e.target.value.toUpperCase() })}
            placeholder="e.g. EARLYBIRD20"
            className="font-mono uppercase font-bold"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Discount Type">
            <Select
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              options={[
                { value: 'PERCENTAGE', label: 'Percentage (%)' },
                { value: 'FIXED', label: 'Fixed Amount (₹)' },
              ]}
            />
          </FormField>

          <FormField label="Discount Value" required>
            <Input
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              icon={formData.discountType === 'PERCENTAGE' ? Percent : DollarSign}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Minimum Purchase (INR ₹)">
            <Input
              type="number"
              value={formData.minimumPurchase}
              onChange={(e) => setFormData({ ...formData, minimumPurchase: e.target.value })}
            />
          </FormField>

          <FormField label="Usage Limit (Redemptions)">
            <Input
              type="number"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              icon={Hash}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Valid From">
            <Input
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              icon={Calendar}
            />
          </FormField>

          <FormField label="Valid Until">
            <Input
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              icon={Calendar}
            />
          </FormField>
        </div>

        <FormField label="Application Scope">
          <Select
            value={formData.applicationScope}
            onChange={(e) => setFormData({ ...formData, applicationScope: e.target.value })}
            options={[
              { value: 'ENTIRE_SUBSCRIPTION', label: 'Entire Recurring Subscription' },
              { value: 'SELECTED_PRODUCTS', label: 'Selected Software Add-ons Only' },
            ]}
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF0]">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {discount ? 'Update Rule' : 'Create Discount'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

