import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField } from '../../components/forms/FormField';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { Textarea } from '../../components/forms/Textarea';
import { mockAdapter } from '../../services/api';
import { planService } from '../../services/planService';
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'sonner';
import { Plus, FileText, Send, Edit2, Trash2 } from 'lucide-react';

export const QuotationTemplatesPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    planId: '',
    paymentTerms: 'NET 15',
    validityDays: 30,
    notes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [tplData, planRes] = await Promise.all([
        mockAdapter.getCollection('quotationTemplates'),
        planService.getAll(),
      ]);
      setTemplates(tplData || []);
      setPlans(planRes.data || []);
    } catch (err) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      planId: plans[0]?.id || '',
      paymentTerms: 'NET 15',
      validityDays: 30,
      notes: 'Terms: Standard Brightloop Master Subscription Agreement applies.',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTemplate(t);
    setFormData({
      name: t.name,
      description: t.description || '',
      planId: t.planId || '',
      paymentTerms: t.paymentTerms || 'NET 15',
      validityDays: t.validityDays || 30,
      notes: t.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Template name is required');
      return;
    }

    try {
      if (editingTemplate) {
        await mockAdapter.updateItem('quotationTemplates', editingTemplate.id, formData);
        toast.success(`Template ${formData.name} updated successfully`);
      } else {
        await mockAdapter.createItem('quotationTemplates', {
          ...formData,
          id: `TMPL-${Date.now().toString().slice(-4)}`,
        });
        toast.success(`Template ${formData.name} created successfully`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to save template');
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete template ${t.name}?`)) return;
    try {
      await mockAdapter.deleteItem('quotationTemplates', t.id);
      toast.success(`Template ${t.name} deleted`);
      loadData();
    } catch (err) {
      toast.error('Failed to delete template');
    }
  };

  const handleCreateQuotation = (t) => {
    navigate(`/quotations/new?templateId=${t.id}&planId=${t.planId}`);
  };

  const columns = [
    {
      key: 'name',
      header: 'Template Name',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-[#202744] block">{val}</span>
          <span className="text-xs text-slate-500 line-clamp-1">{row.description}</span>
        </div>
      ),
    },
    {
      key: 'planId',
      header: 'Predefined Plan',
      render: (val) => {
        const plan = plans.find((p) => p.id === val);
        return plan ? (
          <div>
            <span className="font-medium text-[#202744] block">{plan.name}</span>
            <span className="text-[11px] text-slate-500 font-mono">
              {formatCurrency(plan.basePrice)} / {plan.billingFrequency?.toLowerCase()}
            </span>
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        );
      },
    },
    {
      key: 'paymentTerms',
      header: 'Payment Terms',
      render: (val) => (
        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-mono font-medium">
          {val || 'NET 15'}
        </span>
      ),
    },
    {
      key: 'validityDays',
      header: 'Validity Period',
      render: (val) => <span className="text-xs text-slate-600">{val || 30} days</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="outline"
            icon={Send}
            onClick={() => handleCreateQuotation(row)}
            title="Create Quotation from Template"
          >
            Use Template
          </Button>
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-[#6172E8] rounded-md transition-colors"
            title="Edit Template"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
            title="Delete Template"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotation Templates"
        subtitle="Standardized proposal templates with preset software plans, terms, and billing clauses."
      >
        <Button onClick={handleOpenCreate} icon={Plus} variant="primary">
          Create Template
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={templates}
        loading={loading}
        searchPlaceholder="Search templates by title or terms..."
        emptyTitle="No quotation templates found"
        emptyDescription="Create a template to speed up your sales quotation workflow."
        emptyActionLabel="Create Template"
        onEmptyAction={handleOpenCreate}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? 'Edit Template' : 'Create Quotation Template'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Template Title" required>
            <Input
              placeholder="e.g. Standard SaaS Scale Agreement"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Summary Description">
            <Input
              placeholder="Target customer segment or deal size..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Default Subscription Plan">
              <Select
                value={formData.planId}
                onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
              >
                <option value="">No Default Plan</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatCurrency(p.basePrice)}/{p.billingFrequency?.toLowerCase()})
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Payment Terms">
              <Select
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              >
                <option value="IMMEDIATE">Immediate</option>
                <option value="NET 15">NET 15 Days</option>
                <option value="NET 30">NET 30 Days</option>
                <option value="NET 45">NET 45 Days</option>
                <option value="NET 60">NET 60 Days</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Default Validity (Days)">
            <Input
              type="number"
              min="1"
              max="180"
              value={formData.validityDays}
              onChange={(e) => setFormData({ ...formData, validityDays: Number(e.target.value) })}
            />
          </FormField>

          <FormField label="Standard Contract Terms & Notes">
            <Textarea
              rows={3}
              placeholder="Tax clauses, SLA commitments, payment instructions..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

