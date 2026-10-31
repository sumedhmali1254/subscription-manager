import React, { useState, useEffect } from 'react';
import { discountService } from '../../services/discountService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { DiscountFormModal } from './DiscountFormModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Percent, Edit2, Trash2 } from 'lucide-react';

export const DiscountListPage = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const res = await discountService.getAll();
      setDiscounts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleSaveDiscount = async (data) => {
    setFormLoading(true);
    try {
      if (selectedDiscount) {
        await discountService.update(selectedDiscount.id, data);
      } else {
        await discountService.create(data);
      }
      setIsModalOpen(false);
      fetchDiscounts();
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await discountService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchDiscounts();
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: 'discountName',
      header: 'Coupon Code',
      sortable: true,
      render: (val) => (
        <span className="font-mono font-bold text-[#5263D9] bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs">
          {val}
        </span>
      ),
    },
    {
      key: 'discountType',
      header: 'Type',
      sortable: true,
      render: (val) => (
        <span className="text-slate-600 font-medium capitalize text-[11px]">
          {val.toLowerCase()}
        </span>
      ),
    },
    {
      key: 'discountValue',
      header: 'Discount Value',
      sortable: true,
      render: (val, row) => (
        <span className="font-bold text-[#202744]">
          {row.discountType === 'PERCENTAGE' ? `${val}% OFF` : `₹${val} OFF`}
        </span>
      ),
    },
    {
      key: 'usedCount',
      header: 'Usage Count',
      sortable: true,
      render: (val, row) => (
        <span className="text-slate-700">
          <span className="font-bold text-[#202744]">{val || 0}</span> / {row.usageLimit}
        </span>
      ),
    },
    {
      key: 'validUntil',
      header: 'Validity Period',
      sortable: true,
      render: (_, row) => (
        <span className="text-slate-600 text-[11px]">
          {formatDate(row.validFrom)} - {formatDate(row.validUntil)}
        </span>
      ),
    },
    {
      key: 'activeStatus',
      header: 'Status',
      sortable: true,
      render: (val) => (
        <Badge variant={val ? 'success' : 'neutral'} dot>
          {val ? 'Active' : 'Inactive'}
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
            onClick={() => {
              setSelectedDiscount(row);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            title="Edit Discount"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
            title="Delete Discount"
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
        title="Discounts & Promotions"
        subtitle="Configure recurring subscription coupon codes and promotional rules."
      >
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setSelectedDiscount(null);
            setIsModalOpen(true);
          }}
        >
          Create Discount
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={discounts}
        loading={loading}
        searchPlaceholder="Search coupon codes..."
        exportFilename="discount_rules"
      />

      <DiscountFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveDiscount}
        discount={selectedDiscount}
        loading={formLoading}
      />

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Discount Rule"
        message={`Are you sure you want to deactivate promotion "${deleteTarget?.discountName}"?`}
        confirmLabel="Delete Rule"
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

