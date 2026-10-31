import React, { useState, useEffect } from 'react';
import { mockAdapter } from '../../services/api';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Tabs } from '../../components/common/Tabs';
import { FormField } from '../../components/forms/FormField';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { Textarea } from '../../components/forms/Textarea';
import { Switch } from '../../components/forms/Switch';
import { Button } from '../../components/common/Button';
import { toast } from 'sonner';
import {
  Building,
  CreditCard,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  Key,
  FlaskConical,
  RefreshCw,
  Database,
  Zap,
} from 'lucide-react';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Mock data mode toggle — persists in localStorage
  const [useMock, setUseMock] = useState(() => {
    const stored = localStorage.getItem('recurix_use_mock');
    return stored === null ? true : stored === 'true';
  });

  const [settings, setSettings] = useState({
    companyName: 'Brightloop Software Pvt Ltd',
    tagline: 'Manage Recurring Revenue. Simplify Growth.',
    legalName: 'Brightloop Software Solutions Private Limited',
    gstin: '29AAACB1234D1Z8',
    cin: 'U72200KA2024PTC189001',
    pan: 'AAACB1234D',
    email: 'billing@brightloop.io',
    phone: '+91 (080) 4123 9900',
    website: 'https://brightloop.io',
    address: 'Tower B, 7th Floor, Global Technology Park, Outer Ring Road, Bengaluru 560103',
    defaultCurrency: 'INR',
    defaultTaxRate: 18,
    paymentTerms: 'NET 15',
    gracePeriodDays: 7,
    autoInvoiceGeneration: true,
    sendEmailOnInvoice: true,
    sendReminderBeforeDue: true,
    reminderDaysBefore: 3,
  });

  useEffect(() => {
    mockAdapter.getCompanySettings().then(data => {
      if (data) setSettings(data);
    });
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await mockAdapter.updateCompanySettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMock = (val) => {
    setUseMock(val);
    localStorage.setItem('recurix_use_mock', String(val));
    toast.info(
      val
        ? '✅ Demo mode ON — dashboard now shows sample data'
        : '🔗 Live API mode — backend at localhost:5000 must be running',
      { duration: 4000 }
    );
    setTimeout(() => window.location.reload(), 1200);
  };

  const handleResetMockData = () => {
    if (window.confirm('Reset all mock demo data to defaults. Continue?')) {
      localStorage.removeItem('recurix_db_v2');
      toast.success('Mock data reset — reloading…');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const tabs = [
    { id: 'company', label: 'Company Profile', icon: Building },
    { id: 'billing', label: 'Billing Config', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & API', icon: Shield },
    { id: 'developer', label: 'Developer Tools', icon: FlaskConical },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Settings"
        subtitle="Configure organization profile, automated billing rules, and security policies."
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <form onSubmit={handleSave}>
        {/* ── Tab 1: Company Profile ── */}
        {activeTab === 'company' && (
          <Card>
            <CardHeader>
              <CardTitle>Brightloop Corporate Profile & Tax Identifiers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Trading Brand Name" required>
                  <Input value={settings.companyName} onChange={(e) => handleChange('companyName', e.target.value)} />
                </FormField>
                <FormField label="Registered Legal Corporate Entity">
                  <Input value={settings.legalName} onChange={(e) => handleChange('legalName', e.target.value)} />
                </FormField>
              </div>
              <FormField label="Corporate Brand Tagline">
                <Input value={settings.tagline} onChange={(e) => handleChange('tagline', e.target.value)} />
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="GSTIN">
                  <Input value={settings.gstin} onChange={(e) => handleChange('gstin', e.target.value)} className="font-mono uppercase font-semibold" />
                </FormField>
                <FormField label="Corporate CIN">
                  <Input value={settings.cin} onChange={(e) => handleChange('cin', e.target.value)} className="font-mono uppercase" />
                </FormField>
                <FormField label="PAN">
                  <Input value={settings.pan} onChange={(e) => handleChange('pan', e.target.value)} className="font-mono uppercase" />
                </FormField>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Billing Contact Email">
                  <Input type="email" value={settings.email} onChange={(e) => handleChange('email', e.target.value)} />
                </FormField>
                <FormField label="Support Hotline Phone">
                  <Input value={settings.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                </FormField>
                <FormField label="Website URL">
                  <Input value={settings.website} onChange={(e) => handleChange('website', e.target.value)} />
                </FormField>
              </div>
              <FormField label="Registered Corporate Headquarters Address">
                <Textarea value={settings.address} onChange={(e) => handleChange('address', e.target.value)} rows={2} />
              </FormField>
            </CardContent>
          </Card>
        )}

        {/* ── Tab 2: Billing Configuration ── */}
        {activeTab === 'billing' && (
          <Card>
            <CardHeader>
              <CardTitle>Automated Subscription & Billing Cycle Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Default Billing Currency">
                  <Select
                    value={settings.defaultCurrency}
                    onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                    options={[
                      { value: 'INR', label: 'INR (₹) - Indian Rupee' },
                      { value: 'USD', label: 'USD ($) - US Dollar' },
                      { value: 'EUR', label: 'EUR (€) - Euro' },
                    ]}
                  />
                </FormField>
                <FormField label="Default Payment Terms">
                  <Select
                    value={settings.paymentTerms}
                    onChange={(e) => handleChange('paymentTerms', e.target.value)}
                    options={[
                      { value: 'Immediate', label: 'Immediate Payment' },
                      { value: 'NET 15', label: 'NET 15 Days' },
                      { value: 'NET 30', label: 'NET 30 Days' },
                    ]}
                  />
                </FormField>
                <FormField label="Dunning Grace Period (Days)">
                  <Input type="number" value={settings.gracePeriodDays} onChange={(e) => handleChange('gracePeriodDays', Number(e.target.value))} />
                </FormField>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                <Switch
                  label="Automated Recurring Invoice Generation"
                  description="Automatically execute billing run and generate invoices when subscriptions reach renewal date"
                  checked={settings.autoInvoiceGeneration}
                  onChange={(val) => handleChange('autoInvoiceGeneration', val)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Tab 3: Notifications ── */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Customer Notifications & Dispatch Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <Switch
                label="Email Invoices to Customers Automatically"
                description="Dispatches PDF invoice attachment immediately upon generation"
                checked={settings.sendEmailOnInvoice}
                onChange={(val) => handleChange('sendEmailOnInvoice', val)}
              />
              <Switch
                label="Send Automated Renewal Reminders"
                description="Notifies client finance contact prior to subscription expiration"
                checked={settings.sendReminderBeforeDue}
                onChange={(val) => handleChange('sendReminderBeforeDue', val)}
              />
              <FormField label="Days Before Renewal to Send Reminder">
                <Input type="number" value={settings.reminderDaysBefore} onChange={(e) => handleChange('reminderDaysBefore', Number(e.target.value))} className="w-32" />
              </FormField>
            </CardContent>
          </Card>
        )}

        {/* ── Tab 4: Security ── */}
        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle>REST API Keys & Security Architecture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-[#202744] dark:text-white block">Production REST API Key</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="rcx_live_99a8b7c6d5e4f3a2b1c0_brightloop"
                    className="flex-1 p-2 text-xs font-mono bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => { navigator.clipboard?.writeText('rcx_live_99a8b7c6d5e4f3a2b1c0_brightloop'); toast.success('API key copied!'); }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Used for server-to-server integration between Express backend and client billing events.
                </p>
              </div>
              <div className="space-y-2">
                <span className="font-bold text-[#202744] dark:text-white block">Enterprise Compliance Standards:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>SOC2 Type II Audit Logging Enabled</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>TLS 1.3 Strict Transport Security</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Tab 5: Developer Tools ── */}
        {activeTab === 'developer' && (
          <div className="space-y-4">
            {/* Mock Data Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-500" />
                  Data Source Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <Switch
                    label="Use Mock / Demo Data"
                    description="ON = built-in sample data, no backend needed. OFF = connects to http://localhost:5000/api (MySQL backend must be running)."
                    checked={useMock}
                    onChange={handleToggleMock}
                  />
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
                  useMock
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                }`}>
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  {useMock
                    ? '✅ Mock mode active — all pages show demo sample data'
                    : '🔗 Live API mode — backend at localhost:5000 must be running with MySQL'}
                </div>
              </CardContent>
            </Card>

            {/* Reset Mock Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-rose-500" />
                  Reset Demo Data
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-3">
                <p className="text-slate-500 dark:text-slate-400">
                  Resets all in-browser mock data (customers, subscriptions, invoices, payments, taxes) back to
                  factory defaults. Use this if the dashboard shows zeros or data looks wrong after testing.
                </p>
                <Button type="button" variant="danger" icon={RefreshCw} onClick={handleResetMockData}>
                  Reset Mock Data to Defaults
                </Button>
              </CardContent>
            </Card>

            {/* Demo Credentials */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-500" />
                  Demo Login Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 px-3 font-semibold text-slate-600 dark:text-slate-400">Role</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-600 dark:text-slate-400">Email</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-600 dark:text-slate-400">Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { role: 'Admin', email: 'admin@brightloop.io', password: 'Admin@123' },
                      { role: 'Staff', email: 'staff@brightloop.io', password: 'Staff@123' },
                      { role: 'Customer', email: 'customer@acme.com', password: 'Customer@123' },
                    ].map(row => (
                      <tr key={row.role}>
                        <td className="py-2 px-3 font-semibold text-[#5263D9] dark:text-indigo-400">{row.role}</td>
                        <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">{row.email}</td>
                        <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">{row.password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bottom Save Bar — hidden on developer tab */}
        {activeTab !== 'developer' && (
          <div className="mt-6 flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-[#E7EAF0] dark:border-slate-700 shadow-card">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Settings updated successfully!
              </span>
            ) : (
              <span className="text-xs text-[#64748B] dark:text-slate-400">Changes will apply across your Brightloop instance.</span>
            )}
            <Button type="submit" variant="primary" loading={loading} icon={Save}>
              Save Configuration
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
