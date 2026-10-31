import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { UserFormModal } from './UserFormModal';
import { ROLE_LABELS } from '../../constants/roles';
import { formatDate } from '../../utils/formatters';
import { UserPlus, Edit2, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export const UserListPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll();
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async (data) => {
    setFormLoading(true);
    try {
      if (selectedUser) {
        await userService.update(selectedUser.id, data);
      } else {
        await userService.create(data);
      }
      setIsModalOpen(false);
      fetchUsers();
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await userService.toggleStatus(user.id, user.status);
      fetchUsers();
    } catch (e) {
      alert('Failed to update user status');
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Member Name',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatar} name={row.name} size="sm" />
          <div>
            <div className="font-semibold text-[#202744]">{row.name}</div>
            <div className="text-[11px] text-[#64748B]">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Access Role',
      sortable: true,
      render: (val) => (
        <span className={`
          px-2.5 py-0.5 rounded-full text-xs font-semibold
          ${val === 'ADMIN' ? 'bg-[#EEF0FD] text-[#5263D9]' : val === 'STAFF' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'}
        `}>
          {ROLE_LABELS[val] || val}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (val) => <span className="text-slate-600">{val || '—'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Added Date',
      sortable: true,
      render: (val) => <span className="text-slate-600">{formatDate(val)}</span>,
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
        <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => {
              setSelectedUser(row);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
            title="Edit Details"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleToggleStatus(row)}
            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${row.status === 'ACTIVE' ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
            title={row.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
          >
            {row.status === 'ACTIVE' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Members & Staff"
        subtitle="Manage administrator and billing operations accounts. Restricted to administrators."
      >
        {currentUser?.role === 'ADMIN' ? (
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
          >
            Add Staff Member
          </Button>
        ) : (
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
            <ShieldAlert className="w-4 h-4" />
            Staff creation restricted to Administrators
          </div>
        )}
      </PageHeader>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        searchPlaceholder="Search team members by name or email..."
        exportFilename="team_members"
      />

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveUser}
        user={selectedUser}
        loading={formLoading}
      />
    </div>
  );
};

