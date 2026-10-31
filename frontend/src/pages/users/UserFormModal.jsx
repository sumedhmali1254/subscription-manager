import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { FormField } from '../../components/forms/FormField';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { Button } from '../../components/common/Button';
import { validateEmail } from '../../utils/validators';
import { User, Mail, Phone, Lock, ShieldCheck } from 'lucide-react';

export const UserFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  user = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'STAFF',
    phone: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'STAFF',
        phone: user.phone || '',
        password: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'STAFF',
        phone: '',
        password: '',
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim() || !validateEmail(formData.email)) newErrors.email = 'Valid email is required';

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
      title={user ? 'Edit Team Member' : 'Add Internal Staff Member'}
      subtitle="Configure role access permissions for Brightloop operations"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <FormField label="Full Name" required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Sarah Jenkins"
            icon={User}
          />
        </FormField>

        <FormField label="Corporate Email" required error={errors.email}>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. staff@brightloop.io"
            icon={Mail}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Assigned Role" required>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'ADMIN', label: 'Administrator (Full Access)' },
                { value: 'STAFF', label: 'Billing Staff (Operations)' },
                { value: 'CUSTOMER', label: 'Customer (Portal Only)' },
              ]}
            />
          </FormField>

          <FormField label="Phone Number">
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98220 12345"
              icon={Phone}
            />
          </FormField>
        </div>

        {!user && (
          <FormField label="Temporary Password">
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Leave empty for auto-generated invite"
              icon={Lock}
            />
          </FormField>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7EAF0]">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {user ? 'Update Member' : 'Create Staff Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

