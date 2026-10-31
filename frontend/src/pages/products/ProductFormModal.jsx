import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { FormField } from '../../components/forms/FormField';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { Textarea } from '../../components/forms/Textarea';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';
import { Plus, Trash2, Tag, DollarSign, Layers } from 'lucide-react';

export const ProductFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  product = null,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'SERVICE',
    salesPrice: 2000,
    costPrice: 800,
    description: '',
    status: 'ACTIVE',
    variants: [
      { id: 'VAR-1', name: 'Standard Edition', attribute: 'Tier', priceAdjustment: 0, status: 'ACTIVE' },
    ],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        type: product.type || 'SERVICE',
        salesPrice: product.salesPrice || 0,
        costPrice: product.costPrice || 0,
        description: product.description || '',
        status: product.status || 'ACTIVE',
        variants: product.variants?.length ? product.variants : [
          { id: 'VAR-1', name: 'Standard Edition', attribute: 'Tier', priceAdjustment: 0, status: 'ACTIVE' }
        ],
      });
    } else {
      setFormData({
        name: '',
        type: 'SERVICE',
        salesPrice: 2000,
        costPrice: 800,
        description: '',
        status: 'ACTIVE',
        variants: [
          { id: 'VAR-1', name: 'Standard Edition', attribute: 'Tier', priceAdjustment: 0, status: 'ACTIVE' },
        ],
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: `VAR-NEW-${Date.now()}`,
          name: '',
          attribute: 'Tier',
          priceAdjustment: 0,
          status: 'ACTIVE',
        },
      ],
    }));
  };

  const handleRemoveVariant = (index) => {
    if (formData.variants.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...formData.variants];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, variants: updated }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (formData.salesPrice === '' || Number(formData.salesPrice) < 0) newErrors.salesPrice = 'Sales price must be positive';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      salesPrice: Number(formData.salesPrice),
      costPrice: Number(formData.costPrice || 0),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Software Product' : 'Add New Product'}
      subtitle="Catalog items, subscriptions, and add-on components"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Product Name" required error={errors.name}>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Business Software Suite"
              icon={Tag}
            />
          </FormField>

          <FormField label="Product Type">
            <Select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              options={[
                { value: 'SERVICE', label: 'Service / Cloud Subscription' },
                { value: 'CONSUMABLE', label: 'Consumable / Resource Usage' },
                { value: 'STORABLE', label: 'Storable Hardware / Appliance' },
              ]}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Base Sales Price (INR ₹)" required error={errors.salesPrice}>
            <Input
              type="number"
              value={formData.salesPrice}
              onChange={(e) => handleChange('salesPrice', e.target.value)}
              placeholder="2000"
              icon={DollarSign}
            />
          </FormField>

          <FormField label="Cost Price (INR ₹)">
            <Input
              type="number"
              value={formData.costPrice}
              onChange={(e) => handleChange('costPrice', e.target.value)}
              placeholder="800"
              icon={DollarSign}
            />
          </FormField>

          <FormField label="Status">
            <Select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'ARCHIVED', label: 'Archived' },
              ]}
            />
          </FormField>
        </div>

        <FormField label="Description & Contract Notes">
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Key features, SLA specs, and user seat limits..."
            rows={2}
          />
        </FormField>

        {/* Dynamic Product Variant Builder */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-xs font-bold text-[#202744] uppercase tracking-wider font-heading">
                Product Variants & Pricing Adjustments
              </h4>
              <p className="text-[11px] text-[#64748B]">
                e.g. Odoo Brand (+₹560) or Enterprise (+₹1,200)
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="xs"
              icon={Plus}
              onClick={handleAddVariant}
            >
              Add Variant
            </Button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto p-1">
            {formData.variants.map((v, i) => {
              const finalPrice = Number(formData.salesPrice || 0) + Number(v.priceAdjustment || 0);
              return (
                <div key={v.id || i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Variant name (e.g. Odoo Brand Edition)"
                      value={v.name}
                      onChange={(e) => handleVariantChange(i, 'name', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="w-full sm:w-32">
                    <input
                      type="text"
                      placeholder="Attribute (Tier)"
                      value={v.attribute}
                      onChange={(e) => handleVariantChange(i, 'attribute', e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="w-full sm:w-36 flex items-center gap-1">
                    <span className="text-xs font-medium text-slate-500">+₹</span>
                    <input
                      type="number"
                      placeholder="Price adj."
                      value={v.priceAdjustment}
                      onChange={(e) => handleVariantChange(i, 'priceAdjustment', Number(e.target.value))}
                      className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="text-xs font-bold text-[#5263D9] whitespace-nowrap min-w-[90px] text-right">
                    = {formatCurrency(finalPrice)}
                  </div>

                  <button
                    type="button"
                    disabled={formData.variants.length <= 1}
                    onClick={() => handleRemoveVariant(i)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Remove variant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7EAF0]">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {product ? 'Update Product' : 'Save Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

