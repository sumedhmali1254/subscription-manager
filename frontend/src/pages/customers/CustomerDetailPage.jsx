import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Tabs } from '../../components/common/Tabs';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Avatar } from '../../components/common/Avatar';
import { CustomerFormModal } from './CustomerFormModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Repeat,
  Receipt,
  Clock,
  ArrowLeft,
  Edit2,
  Plus,
} from 'lucide-react';

export const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const res = await customerService.getById(id);
      setCustomer(res.data);

      const [subsRes, invsRes, paysRes] = await Promise.all([
        customerService.getCustomerSubscriptions(id),
        customerService.getCustomerInvoices(id),
        customerService.getCustomerPayments(id),
      ]);

      setSubscriptions(subsRes.data);
      setInvoices(invsRes.data);
      setPayments(paysRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Loading customer profile...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="text-base font-bold text-[#202744]">Customer Not Found</h3>
        <Button onClick={() => navigate('/customers')} variant="secondary" icon={ArrowLeft}>
          Back to Customers
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building },
    { id: 'subscriptions', label: 'Subscriptions', count: subscriptions.length, icon: Repeat },
    { id: 'invoices', label: 'Invoices', count: invoices.length, icon: Receipt },
    { id: 'payments', label: 'Payments', count: payments.length, icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Back button and Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/customers')}
          className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#5263D9] mb-3 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Customers
        </button>

        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={customer.name} size="lg" />
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-[#202744] font-heading">{customer.name}</h2>
                <Badge variant={customer.status === 'ACTIVE' ? 'success' : 'neutral'} dot>
                  {customer.status}
                </Badge>
              </div>
              <div className="text-xs text-[#64748B] flex items-center gap-2 mt-1">
                <span className="font-semibold text-slate-700">{customer.company}</span>
                <span>•</span>
                <span className="font-mono text-[#5263D9]">{customer.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              icon={Edit2}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate(`/subscriptions/new?customerId=${customer.id}`)}
            >
              New Subscription
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[#64748B] block font-medium">Contact Person</span>
                  <span className="text-sm font-semibold text-[#202744]">{customer.name}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block font-medium">Company Name</span>
                  <span className="text-sm font-semibold text-[#202744]">{customer.company}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block font-medium">Billing Email</span>
                  <span className="text-sm font-semibold text-[#202744] flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {customer.email}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block font-medium">Phone Number</span>
                  <span className="text-sm font-semibold text-[#202744] flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {customer.phone || '—'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[#64748B] block font-medium">Tax Identifier (GSTIN / VAT)</span>
                  <span className="text-xs font-mono font-bold text-slate-700">{customer.gstin || 'Unregistered'}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block font-medium">Settlement Currency</span>
                  <span className="text-xs font-semibold text-slate-700">{customer.currency || 'INR (₹)'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[#64748B] block font-medium">Registered Address</span>
                <span className="text-xs text-slate-700 leading-relaxed mt-0.5 block flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  {customer.address || 'No billing address specified'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-4 bg-[#EEF0FD]/60 rounded-xl border border-indigo-100">
                <span className="text-[11px] text-[#5263D9] uppercase font-bold tracking-wider">Total Lifetime Invoiced</span>
                <div className="text-2xl font-bold font-heading text-[#202744] mt-1">
                  {formatCurrency(customer.totalRevenue || 0)}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Active Subscriptions:</span>
                  <span className="font-bold text-[#202744]">{subscriptions.filter(s => s.status === 'ACTIVE').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Total Invoices Issued:</span>
                  <span className="font-bold text-[#202744]">{invoices.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Payments Received:</span>
                  <span className="font-bold text-emerald-600">{payments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Client Since:</span>
                  <span className="font-medium text-slate-600">{formatDate(customer.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Subscriptions */}
      {activeTab === 'subscriptions' && (
        <Card>
          <CardHeader
            action={
              <Button
                size="sm"
                icon={Plus}
                onClick={() => navigate(`/subscriptions/new?customerId=${customer.id}`)}
              >
                Add Subscription
              </Button>
            }
          >
            <CardTitle>Customer Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {subscriptions.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B]">No subscriptions active for this customer.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E7EAF0] text-[#64748B] text-[11px] uppercase">
                      <th className="py-2.5 px-4 font-semibold">Subscription #</th>
                      <th className="py-2.5 px-4 font-semibold">Plan</th>
                      <th className="py-2.5 px-4 font-semibold">Amount</th>
                      <th className="py-2.5 px-4 font-semibold">Next Billing</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscriptions.map((sub) => (
                      <tr
                        key={sub.id}
                        onClick={() => navigate(`/subscriptions/${sub.id}`)}
                        className="hover:bg-slate-50 cursor-pointer"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-[#5263D9]">{sub.subscriptionNumber}</td>
                        <td className="py-3 px-4 font-semibold text-[#202744]">{sub.planName}</td>
                        <td className="py-3 px-4 font-bold text-[#202744]">{formatCurrency(sub.amount)}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(sub.nextBillingDate)}</td>
                        <td className="py-3 px-4"><StatusBadge status={sub.status} type="subscription" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Invoices */}
      {activeTab === 'invoices' && (
        <Card>
          <CardHeader>
            <CardTitle>Billing Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B]">No invoices generated yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E7EAF0] text-[#64748B] text-[11px] uppercase">
                      <th className="py-2.5 px-4 font-semibold">Invoice #</th>
                      <th className="py-2.5 px-4 font-semibold">Issue Date</th>
                      <th className="py-2.5 px-4 font-semibold">Due Date</th>
                      <th className="py-2.5 px-4 font-semibold">Total Amount</th>
                      <th className="py-2.5 px-4 font-semibold">Balance</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        onClick={() => navigate(`/invoices/${inv.id}`)}
                        className="hover:bg-slate-50 cursor-pointer"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-[#202744]">{inv.invoiceNumber}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(inv.invoiceDate)}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(inv.dueDate)}</td>
                        <td className="py-3 px-4 font-bold text-[#202744]">{formatCurrency(inv.totalAmount)}</td>
                        <td className="py-3 px-4 font-semibold text-rose-600">{formatCurrency(inv.outstandingBalance)}</td>
                        <td className="py-3 px-4"><StatusBadge status={inv.status} type="invoice" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Payments */}
      {activeTab === 'payments' && (
        <Card>
          <CardHeader>
            <CardTitle>Recorded Payment Receipts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B]">No payment transactions recorded.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E7EAF0] text-[#64748B] text-[11px] uppercase">
                      <th className="py-2.5 px-4 font-semibold">Payment Ref</th>
                      <th className="py-2.5 px-4 font-semibold">Invoice #</th>
                      <th className="py-2.5 px-4 font-semibold">Date</th>
                      <th className="py-2.5 px-4 font-semibold">Method</th>
                      <th className="py-2.5 px-4 font-semibold">Amount</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-[#5263D9]">{p.paymentReference}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{p.invoiceNumber}</td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(p.paymentDate)}</td>
                        <td className="py-3 px-4 font-medium text-slate-700">{p.paymentMethod}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">{formatCurrency(p.amount)}</td>
                        <td className="py-3 px-4"><StatusBadge status={p.status} type="payment" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Customer Modal */}
      <CustomerFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={customer}
        onSubmit={async (data) => {
          await customerService.update(customer.id, data);
          setIsEditModalOpen(false);
          fetchCustomerData();
        }}
      />
    </div>
  );
};

