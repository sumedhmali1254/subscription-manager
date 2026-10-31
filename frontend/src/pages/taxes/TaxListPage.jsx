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
import { toast } from 'sonner';

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
      const raw = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      const normalized = raw.map((t) => {
        const name = t.taxName || t.name || 'GST 18%';
        const rate = Number(t.taxRate !== undefined ? t.taxRate : (t.rate !== undefined ? t.rate : 18));
        const type = t.taxType || t.type || 'PERCENTAGE';
        const active = t.activeStatus !== undefined ? Boolean(t.activeStatus) : (t.status === 'ACTIVE');
        return {
          ...t,
          id: t.id,
          name,
          taxName: name,
          rate,
          taxRate: rate,
          type,
          taxType: type,
          validFrom: t.validFrom || '2026-01-01',
          validUntil: t.validUntil || '2026-12-31',
          activeStatus: active,
          status: active ? 'ACTIVE' : 'INACTIVE',
        };
      });
      setTaxes(normalized);
    } catch (err) {
      console.error('Failed to load taxes:', err);
      toast.error('Could not load tax configurations');
      setTaxes([]);
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
        toast.success('Tax rule updated successfully');
      } else {
        await taxService.create(data);
        toast.success('New tax rule created successfully');
      }
      setIsModalOpen(false);
      fetchTaxes();
    } catch (err) {
      console.error('Save tax error:', err);
      toast.error('Failed to save tax configuration');
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await taxService.delete(deleteTarget.id);
      toast.success('Tax rule deleted');
      setDeleteTarget(null);
      fetchTaxes();
    } catch (err) {
      console.error('Delete tax error:', err);
      toast.error('Failed to delete tax rule');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: 'taxName',
      header: 'Tax Rule Name',
      sortable: true,
      render: (_, row) => (
        <div>
          <span className="font-semibold text-[#202744] dark:text-slate-100 block">
            {row.taxName || row.name || '—'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {row.id}
          </span>
        </div>
      ),
    },
    {
      key: 'taxRate',
      header: 'Tax Rate',
      sortable: true,
      render: (_, row) => {
        const rate = row.taxRate !== undefined ? row.taxRate : (row.rate ?? 0);
        return (
          <span className="font-extrabold text-[#5263D9] dark:text-indigo-400 text-sm">
            {rate}%
          </span>
        );
      },
    },
    {
      key: 'taxType',
      header: 'Type',
      sortable: true,
      render: (_, row) => {
        const typeStr = String(row.taxType || row.type || 'PERCENTAGE');
        return (
          <span className="text-slate-600 dark:text-slate-300 text-[11px] capitalize">
            {typeStr.toLowerCase()}
          </span>
        );
      },
    },
    {
      key: 'validUntil',
      header: 'Effective Period',
      sortable: true,
      render: (_, row) => (
        <span className="text-slate-600 dark:text-slate-300 text-[11px]">
          {formatDate(row.validFrom || '2026-01-01')} – {formatDate(row.validUntil || '2026-12-31')}
        </span>
      ),
    },
    {
      key: 'activeStatus',
      header: 'Status',
      sortable: true,
      render: (_, row) => {
        const isActive = row.activeStatus !== undefined ? row.activeStatus : (row.status === 'ACTIVE');
        return (
          <Badge variant={isActive ? 'success' : 'neutral'} dot>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
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
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
            title="Edit Tax"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer transition-colors"
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
        message={`Are you sure you want to remove tax rule "${deleteTarget?.taxName || deleteTarget?.name}"?`}
        confirmLabel="Delete Rule"
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};
