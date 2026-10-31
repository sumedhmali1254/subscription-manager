import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { ProductFormModal } from './ProductFormModal';
import { formatCurrency } from '../../utils/formatters';
import { Package, Plus, Eye, Edit2, Trash2, Layers } from 'lucide-react';

export const ProductListPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getAll({ type: typeFilter });
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [typeFilter]);

  const handleSaveProduct = async (data) => {
    setFormLoading(true);
    try {
      if (selectedProduct) {
        await productService.update(selectedProduct.id, data);
      } else {
        await productService.create(data);
      }
      setIsModalOpen(false);
      fetchProducts();
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await productService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchProducts();
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'Product ID',
      sortable: true,
      render: (val) => <span className="font-mono font-bold text-[#5263D9]">{val}</span>,
    },
    {
      key: 'name',
      header: 'Product Name & Description',
      sortable: true,
      render: (_, row) => (
        <div>
          <div className="font-semibold text-[#202744] hover:text-[#5263D9] transition-colors">{row.name}</div>
          <div className="text-[11px] text-[#64748B] line-clamp-1 max-w-sm">{row.description}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (val) => (
        <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-slate-100 text-slate-700 uppercase">
          {val}
        </span>
      ),
    },
    {
      key: 'salesPrice',
      header: 'Base Sales Price',
      sortable: true,
      render: (val) => <span className="font-bold text-[#202744]">{formatCurrency(val)}</span>,
    },
    {
      key: 'variants',
      header: 'Variants',
      render: (variants) => (
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#5263D9]" />
          <span className="font-medium text-slate-700">{variants?.length || 0} variant(s)</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (val) => (
        <Badge variant={val === 'ACTIVE' ? 'success' : 'neutral'} dot>
          {val}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => navigate(`/products/${row.id}`)}
            className="p-1.5 text-slate-400 hover:text-[#5263D9] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedProduct(row);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Edit Product"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Variants"
        subtitle="Manage software catalog items, add-on modules, and variant price adjustments."
      >
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setSelectedProduct(null);
            setIsModalOpen(true);
          }}
        >
          Add Product
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        searchPlaceholder="Search products by title or description..."
        exportFilename="products_catalog"
        onRowClick={(row) => navigate(`/products/${row.id}`)}
        filterComponent={
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#64748B] font-medium hidden sm:inline">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#E7EAF0] text-xs bg-white text-[#202744] outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="SERVICE">Service</option>
              <option value="CONSUMABLE">Consumable</option>
              <option value="STORABLE">Storable</option>
            </select>
          </div>
        }
      />

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveProduct}
        product={selectedProduct}
        loading={formLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Subscriptions already referencing this product will retain archived snapshots.`}
        confirmLabel="Delete Product"
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

