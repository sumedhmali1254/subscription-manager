import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { CustomerFormModal } from './CustomerFormModal';
import { formatCurrency } from '../../utils/formatters';
import { UserPlus, Eye, Edit2, Trash2, Building, Mail, Phone } from 'lucide-react';

export const CustomerListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerService.getAll({
        status: statusFilter,
      });
      setCustomers(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  // Open modal if URL query param ?action=create is present
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setSelectedCustomer(null);
      setIsModalOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  const handleSaveCustomer = async (data) => {
    setFormLoading(true);
    try {
      if (selectedCustomer) {
        await customerService.update(selectedCustomer.id, data);
      } else {
        await customerService.create(data);
      }
      setIsModalOpen(false);
      fetchCustomers();
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await customerService.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchCustomers();
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'Customer ID',
      sortable: true,
      render: (val) => <span className="font-mono font-bold text-[#5263D9]">{val}</span>,
    },
    {
      key: 'name',
      header: 'Customer & Company',
      sortable: true,
      render: (_, row) => (
        <div>
          <div className="font-semibold text-[#202744] hover:text-[#5263D9] transition-colors">{row.name}</div>
          <div className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
            <Building className="w-3 h-3 text-slate-400" />
            <span>{row.company}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Contact Info',
      render: (_, row) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[11px] text-slate-600">
            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{row.email}</span>
          </div>
          {row.phone && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{row.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'activeSubscriptions',
      header: 'Subscriptions',
      sortable: true,
      render: (val, row) => (
        <div className="text-center sm:text-left">
          <span className="font-bold text-[#202744]">{val || 0}</span>
          <span className="text-[11px] text-[#64748B] ml-1">active</span>
        </div>
      ),
    },
    {
      key: 'totalRevenue',
      header: 'Total Revenue',
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-[#202744]">
          {formatCurrency(val || 0)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (val) => (
        <Badge
          variant={val === 'ACTIVE' ? 'success' : 'neutral'}
          dot
        >
          {val === 'ACTIVE' ? 'Active' : 'Inactive'}
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
            onClick={() => navigate(`/customers/${row.id}`)}
            className="p-1.5 text-slate-400 hover:text-[#5263D9] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCustomer(row);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Edit Customer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Archive Customer"
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
        title="Customers"
        subtitle="Manage accounts, corporate billing entities, and client relationships."
      >
        <Button
          variant="primary"
          icon={UserPlus}
          onClick={() => {
            setSelectedCustomer(null);
            setIsModalOpen(true);
          }}
        >
          Add Customer
        </Button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        searchPlaceholder="Search by name, company, email..."
        exportFilename="customers_list"
        onRowClick={(row) => navigate(`/customers/${row.id}`)}
        filterComponent={
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#64748B] font-medium hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#E7EAF0] text-xs bg-white text-[#202744] outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        }
      />

      {/* Customer Form Modal */}
      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveCustomer}
        customer={selectedCustomer}
        loading={formLoading}
      />

      {/* Archive / Delete Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Archive Customer"
        message={`Are you sure you want to archive ${deleteTarget?.name} (${deleteTarget?.company})? This will deactivate their automated invoice billing cycle.`}
        confirmLabel="Archive Customer"
        confirmVariant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

