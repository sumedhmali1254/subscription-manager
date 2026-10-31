import React, { useState, useEffect } from 'react';
import { taxService } from '../../services/taxService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { TaxFormModal } from './TaxFormModal';
import { formatDate } from '../../utils/formatters';
import { Plus, Calculator, Edit2, Trash2 } from 'lucide-react';

export const TaxListPage = () => {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTaxes = async () => {
    setLoading(true);
    try {
      const res = await taxService.getAll();
      setTaxes(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const handleSaveTax = async (data) => {
    setFormLoading(true);
    try {
      if (selectedTax) {
        await taxService.update(selectedTax.id, data);
      } else {
        await taxService.create(data);
      }
      setIsModalOpen(false);
      fetchTaxes();
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await taxService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchTaxes();
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: 'taxName',
      header: 'Tax Rule Name',
      sortable: true,
      render: (val) => <span className="font-semibold text-[#202744]">{val}</span>,
    },
    {
      key: 'taxRate',
      header: 'Tax Rate',
      sortable: true,
      render: (val) => (
        <span className="font-extrabold text-[#5263D9] text-sm">
          {val}%
        </span>
      ),
    },
    {
      key: 'taxType',
      header: 'Type',
      sortable: true,
      render: (val) => <span className="text-slate-600 text-[11px] capitalize">{val.toLowerCase()}</span>,
    },
    {
      key: 'validUntil',
      header: 'Effective Period',
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
              setSelectedTax(row);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            title="Edit Tax"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
            title="Delete Tax"
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
        title="Tax Configuration"
        subtitle="Manage statutory GST rates and international zero-rated tax definitions."
      >
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setSelectedTax(null);
            setIsModalOpen(true);
          }}
        >
          Add Tax Rule
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={taxes}
        loading={loading}
        searchPlaceholder="Search taxes..."
        exportFilename="tax_rules"
      />

      <TaxFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTax}
        tax={selectedTax}
        loading={formLoading}
      />

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Tax Rule"
        message={`Are you sure you want to remove tax rule "${deleteTarget?.taxName}"?`}
        confirmLabel="Delete Rule"
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

