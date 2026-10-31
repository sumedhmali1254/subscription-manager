import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { FormField } from '../../components/forms/FormField';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { Textarea } from '../../components/forms/Textarea';
import { Button } from '../../components/common/Button';
import { validateEmail } from '../../utils/validators';
import { User, Mail, Phone, Building, MapPin, FileText } from 'lucide-react';

export const CustomerFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  customer = null, // null for create, object for edit
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    gstin: '',
    currency: 'INR',
    status: 'ACTIVE',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        company: customer.company || '',
        phone: customer.phone || '',
        address: customer.address || '',
        gstin: customer.gstin || '',
        currency: customer.currency || 'INR',
        status: customer.status || 'ACTIVE',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        address: '',
        gstin: '',
        currency: 'INR',
        status: 'ACTIVE',
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim() || !validateEmail(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.company.trim()) newErrors.company = 'Company name is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? 'Edit Customer Details' : 'Add New Customer'}
      subtitle="Brightloop enterprise client account profile"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Contact Person Name" required error={errors.name}>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Priya Sharma"
              icon={User}
            />
          </FormField>

          <FormField label="Company Name" required error={errors.company}>
            <Input
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="e.g. Acme Technologies Pvt Ltd"
              icon={Building}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Email Address" required error={errors.email}>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="e.g. billing@acme.com"
              icon={Mail}
            />
          </FormField>

          <FormField label="Phone Number">
            <Input
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+91 98765 43210"
              icon={Phone}
            />
          </FormField>
        </div>

        <FormField label="Registered Billing Address">
          <Textarea
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Plot 42, Tech Park, Whitefield, Bengaluru 560066"
            rows={2}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Tax GSTIN / VAT ID">
            <Input
              value={formData.gstin}
              onChange={(e) => handleChange('gstin', e.target.value)}
              placeholder="29ABCDE1234F1Z5"
              icon={FileText}
            />
          </FormField>

          <FormField label="Billing Currency">
            <Select
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              options={[
                { value: 'INR', label: 'INR (₹) - Indian Rupee' },
                { value: 'USD', label: 'USD ($) - US Dollar' },
                { value: 'EUR', label: 'EUR (€) - Euro' },
                { value: 'GBP', label: 'GBP (£) - British Pound' },
              ]}
            />
          </FormField>

          <FormField label="Account Status">
            <Select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive / Suspended' },
              ]}
            />
          </FormField>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7EAF0]">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {customer ? 'Update Customer' : 'Save Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

