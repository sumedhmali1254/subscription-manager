import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { FormField } from '../../components/forms/FormField';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { Button } from '../../components/common/Button';
import { Calculator, Percent, Calendar } from 'lucide-react';

export const TaxFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  tax = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    taxName: '',
    taxRate: 18,
    taxType: 'PERCENTAGE',
    validFrom: '2025-01-01',
    validUntil: '2030-12-31',
    activeStatus: true,
  });

  useEffect(() => {
    if (tax) {
      setFormData({
        taxName: tax.taxName || '',
        taxRate: tax.taxRate || 0,
        taxType: tax.taxType || 'PERCENTAGE',
        validFrom: tax.validFrom || '2025-01-01',
        validUntil: tax.validUntil || '2030-12-31',
        activeStatus: tax.activeStatus !== false,
      });
    } else {
      setFormData({
        taxName: '',
        taxRate: 18,
        taxType: 'PERCENTAGE',
        validFrom: '2025-01-01',
        validUntil: '2030-12-31',
        activeStatus: true,
      });
    }
  }, [tax, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.taxName.trim()) {
      alert('Tax name is required');
      return;
    }
    onSubmit({
      ...formData,
      taxRate: Number(formData.taxRate),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tax ? 'Edit Tax Rule' : 'Add Tax Configuration'}
      subtitle="GST rates, export rules, and statutory invoice tax definitions"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <FormField label="Tax Name & HSN/SAC Category" required>
          <Input
            value={formData.taxName}
            onChange={(e) => setFormData({ ...formData, taxName: e.target.value })}
            placeholder="e.g. GST 18% (Standard IT Services)"
            icon={Calculator}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Tax Rate (%)" required>
            <Input
              type="number"
              step="0.01"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
              icon={Percent}
            />
          </FormField>

          <FormField label="Tax Type">
            <Select
              value={formData.taxType}
              onChange={(e) => setFormData({ ...formData, taxType: e.target.value })}
              options={[
                { value: 'PERCENTAGE', label: 'Percentage (%)' },
                { value: 'FIXED', label: 'Fixed Surcharge (₹)' },
              ]}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Effective From">
            <Input
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              icon={Calendar}
            />
          </FormField>

          <FormField label="Effective Until">
            <Input
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              icon={Calendar}
            />
          </FormField>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF0]">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {tax ? 'Update Tax' : 'Save Tax'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

