import React, { useState, useEffect } from 'react';
import { auditService } from '../../services/auditService';
import { PageHeader } from '../../components/layout/PageHeader';
import { DataTable } from '../../components/tables/DataTable';
import { formatDateTime } from '../../utils/formatters';
import { ShieldCheck, User, Clock, Hash } from 'lucide-react';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditService.getAll();
      setLogs(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (val) => <span className="font-mono text-slate-600 text-[11px]">{formatDateTime(val)}</span>,
    },
    {
      key: 'userName',
      header: 'User',
      sortable: true,
      render: (_, row) => (
        <div>
          <span className="font-semibold text-[#202744] block">{row.userName}</span>
          <span className="text-[10px] text-[#64748B]">{row.userEmail}</span>
        </div>
      ),
    },
    {
      key: 'module',
      header: 'Module',
      sortable: true,
      render: (val) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
          {val}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Event Action',
      sortable: true,
      render: (val) => (
        <span className="font-mono font-bold text-[#5263D9] text-[11px]">
          {val}
        </span>
      ),
    },
    {
      key: 'recordId',
      header: 'Record ID',
      sortable: true,
      render: (val) => <span className="font-mono text-slate-600">{val || '—'}</span>,
    },
    {
      key: 'description',
      header: 'Audit Description',
      render: (val) => <span className="text-slate-700 leading-normal">{val}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable security trail of administrative changes, billing runs, and client lifecycle events."
      />

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        searchPlaceholder="Search audit events by action, user or description..."
        exportFilename="audit_logs_trail"
      />
    </div>
  );
};

