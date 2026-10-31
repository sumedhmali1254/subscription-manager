import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FormField } from '../../components/forms/FormField';
import { Input } from '../../components/forms/Input';
import { Select } from '../../components/forms/Select';
import { Textarea } from '../../components/forms/Textarea';
import { productService } from '../../services/productService';
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'sonner';
import { Plus, Layers, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProductVariantsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);

  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    sku: '',
    price: '',
    description: '',
    status: 'ACTIVE',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll();
      setProducts(res.data || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Flatten all variants with their parent product info
  const variants = useMemo(() => {
    const list = [];
    products.forEach((p) => {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v) => {
          list.push({
            ...v,
            productId: p.id,
            productName: p.name,
            productCategory: p.category,
          });
        });
      }
    });
    return list;
  }, [products]);

  const handleOpenCreate = () => {
    setEditingVariant(null);
    setFormData({
      productId: products[0]?.id || '',
      name: '',
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      price: '',
      description: '',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVariant(v);
    setFormData({
      productId: v.productId,
      name: v.name,
      sku: v.sku || '',
      price: v.price || v.additionalPrice || 0,
      description: v.description || '',
      status: v.status || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.productId) {
      toast.error('Name and parent product are required');
      return;
    }

    try {
      const parentProduct = products.find((p) => p.id === formData.productId);
      if (!parentProduct) return;

      let updatedVariants;
      if (editingVariant) {
        updatedVariants = parentProduct.variants.map((v) =>
          v.id === editingVariant.id
            ? { ...v, ...formData, price: Number(formData.price) }
            : v
        );
        toast.success(`Variant ${formData.name} updated successfully`);
      } else {
        const newVar = {
          id: `VAR-${Date.now().toString().slice(-5)}`,
          ...formData,
          price: Number(formData.price) || 0,
        };
        updatedVariants = [...(parentProduct.variants || []), newVar];
        toast.success(`Variant ${formData.name} created successfully`);
      }

      await productService.update(parentProduct.id, {
        ...parentProduct,
        variants: updatedVariants,
      });

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to save variant');
    }
  };

  const handleDelete = async (v) => {
    if (!window.confirm(`Delete variant ${v.name}?`)) return;
    try {
      const parentProduct = products.find((p) => p.id === v.productId);
      if (!parentProduct) return;

      const updatedVariants = parentProduct.variants.filter((item) => item.id !== v.id);
      await productService.update(parentProduct.id, {
        ...parentProduct,
        variants: updatedVariants,
      });
      toast.success(`Variant ${v.name} deleted`);
      loadData();
    } catch (err) {
      toast.error('Failed to delete variant');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Variant Name',
      render: (val, row) => (
        <div>
          <span className="font-semibold text-[#202744] block">{val}</span>
          <span className="text-[10px] text-slate-400 font-mono">{row.sku}</span>
        </div>
      ),
    },
    {
      key: 'productName',
      header: 'Parent Product',
      render: (val, row) => (
        <Link
          to={`/products/${row.productId}`}
          className="font-medium text-[#6172E8] hover:underline flex items-center gap-1"
        >
          <span>{val}</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
        </Link>
      ),
    },
    {
      key: 'price',
      header: 'Price / Add-on',
      render: (val, row) => (
        <span className="font-semibold text-slate-900 font-mono">
          {formatCurrency(val || row.additionalPrice || 0)}
        </span>
      ),
    },
    {
      key: 'productCategory',
      header: 'Category',
      render: (val) => (
        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 font-medium">
          {val || 'Software'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <StatusBadge status={val || 'ACTIVE'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-[#6172E8] rounded-md transition-colors"
            title="Edit Variant"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
            title="Delete Variant"
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
        title="Product Variants"
        subtitle="Manage product variants, add-ons, storage tiers and feature extensions."
      >
        <Button onClick={handleOpenCreate} icon={Plus} variant="primary">
          Add Variant
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={variants}
        loading={loading}
        searchPlaceholder="Search variants by name, SKU or parent product..."
        emptyTitle="No product variants found"
        emptyDescription="Create your first variant to associate with software products."
        emptyActionLabel="Add Variant"
        onEmptyAction={handleOpenCreate}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVariant ? 'Edit Variant' : 'Create Product Variant'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Parent Product" required>
            <Select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              required
            >
              <option value="">Select Parent Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </Select>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Variant Name" required>
              <Input
                placeholder="e.g. 50 GB Extra Cloud Storage"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </FormField>

            <FormField label="SKU / Code">
              <Input
                placeholder="e.g. SKU-STRG-50G"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Price (INR ₹)" required>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 1499.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </FormField>

            <FormField label="Status">
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Description">
            <Textarea
              rows={3}
              placeholder="Features or limits included with this variant..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingVariant ? 'Save Changes' : 'Create Variant'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

