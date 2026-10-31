import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customerService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { FormField } from '../../components/forms/FormField';
import { Input } from '../../components/forms/Input';
import { Textarea } from '../../components/forms/Textarea';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { User, Building, Mail, Phone, MapPin, FileText, Save, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const CustomerProfilePage = () => {
  const { user } = useAuth();
  const customerId = user?.customerId || 'CUST-001';

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    customerService.getById(customerId).then(res => {
      setCustomer(res.data);
      setLoading(false);
    });
  }, [customerId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!customer) return;

    try {
      await customerService.update(customer.id, customer);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) return <div className="p-8 text-center text-xs text-slate-400">Loading profile...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="My Profile & Billing Coordinates"
        subtitle="Manage contact details and statutory tax identification for recurring GST invoices."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact & Company Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <Avatar src={user?.avatar} name={customer?.name || 'Customer'} size="lg" />
              <div>
                <h4 className="text-sm font-bold text-[#202744]">{customer?.name}</h4>
                <p className="text-slate-500">{customer?.company}</p>
                <span className="font-mono text-[#5263D9] text-[11px] font-bold">{customer?.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Contact Person Name" required>
                <Input
                  value={customer?.name || ''}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  icon={User}
                />
              </FormField>

              <FormField label="Company Entity Name" required>
                <Input
                  value={customer?.company || ''}
                  onChange={(e) => setCustomer({ ...customer, company: e.target.value })}
                  icon={Building}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Billing Email">
                <Input
                  type="email"
                  value={customer?.email || ''}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  icon={Mail}
                />
              </FormField>

              <FormField label="Hotline Phone">
                <Input
                  value={customer?.phone || ''}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  icon={Phone}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Tax Identifier (GSTIN / VAT)">
                <Input
                  value={customer?.gstin || ''}
                  onChange={(e) => setCustomer({ ...customer, gstin: e.target.value })}
                  className="font-mono uppercase font-semibold"
                  icon={FileText}
                />
              </FormField>

              <FormField label="Settlement Currency">
                <Input
                  disabled
                  value={`${customer?.currency || 'INR'} (₹)`}
                />
              </FormField>
            </div>

            <FormField label="Registered Tax Invoice Address">
              <Textarea
                value={customer?.address || ''}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                rows={2}
              />
            </FormField>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E7EAF0] shadow-card">
          {saveSuccess ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Billing coordinates updated successfully!
            </span>
          ) : (
            <span className="text-xs text-[#64748B]">These details will reflect on your future recurring tax invoices.</span>
          )}

          <Button type="submit" variant="primary" icon={Save}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

